/** @odoo-module **/

import { registry } from "@web/core/registry";
import { PdfOptionsModal } from "./PdfOptionsModal";

let iframeForReport;

function printPdf(url, callback) {
    let iframe = iframeForReport;
    if (!iframe) {
        iframe = iframeForReport = document.createElement('iframe');
        iframe.className = 'pdfIframe'
        document.body.appendChild(iframe);
        iframe.style.display = 'none';
        iframe.onload = function () {
            setTimeout(function () {
                iframe.focus();
                iframe.contentWindow.print();
                URL.revokeObjectURL(url)
                callback();
            }, 1);
        };
    }
    iframe.src = url;
}

function getReportUrl(action, type) {
    let url = `/report/${type}/${action.report_name}`;
    const actionContext = action.context || {};
    if (action.data && JSON.stringify(action.data) !== "{}") {
        // build a query string with `action.data` (it's the place where reports
        // using a wizard to customize the output traditionally put their options)
        const options = encodeURIComponent(JSON.stringify(action.data));
        const context = encodeURIComponent(JSON.stringify(actionContext));
        url += `?options=${options}&context=${context}`;
    } else {
        if (actionContext.active_ids) {
            url += `/${actionContext.active_ids.join(",")}`;
        }
        if (type === "html") {
            const context = encodeURIComponent(JSON.stringify(env.services.user.context));
            url += `?context=${context}`;
        }
    }
    return url;
}

let wkhtmltopdfStateProm;

registry
    .category("ir.actions.report handlers")
    .add("pdf_report_options_handler", async function (action, options, env) {
        let { default_print_option, report_type } = action;
        if (report_type !== "qweb-pdf" || default_print_option === "download")
            return false;
        if (!default_print_option) {
            let removeDialog;
            default_print_option = await new Promise(resolve => {
                removeDialog = env.services.dialog.add(PdfOptionsModal, {
                    onClose: () => {
                        return resolve("close");
                    },
                    onSelectOption: (option) => {
                        return resolve(option);
                    }
                });
            });
            removeDialog();
            if (default_print_option === "close")
                return true;
            if (default_print_option === "download")
                return false;
        }
        const link = '<br><br><a href="http://wkhtmltopdf.org/" target="_blank">wkhtmltopdf.org</a>';
        const WKHTMLTOPDF_MESSAGES = {
            broken:
                env._t(
                    "Your installation of Wkhtmltopdf seems to be broken. The report will be shown " +
                    "in html."
                ) + link,
            install:
                env._t(
                    "Unable to find Wkhtmltopdf on this system. The report will be shown in " + "html."
                ) + link,
            upgrade:
                env._t(
                    "You should upgrade your version of Wkhtmltopdf to at least 0.12.0 in order to " +
                    "get a correct display of headers and footers as well as support for " +
                    "table-breaking between pages."
                ) + link,
            workers: env._t(
                "You need to start Odoo with at least two workers to print a pdf version of " +
                "the reports."
            ),
        };
        // check the state of wkhtmltopdf before proceeding
        if (!wkhtmltopdfStateProm) {
            wkhtmltopdfStateProm = env.services.rpc("/report/check_wkhtmltopdf");
        }
        const state = await wkhtmltopdfStateProm;
        // display a notification according to wkhtmltopdf's state
        if (state in WKHTMLTOPDF_MESSAGES) {
            env.services.notification.add(WKHTMLTOPDF_MESSAGES[state], {
                sticky: true,
                title: env._t("Report"),
            });
        }
        if (state === "upgrade" || state === "ok") {
            // trigger the download of the PDF report
            //return _triggerDownload(action, options, "pdf");
            const url = getReportUrl(action, "pdf");
            if (default_print_option === "print") {
                env.services.ui.block();
                printPdf(url, () => {
                    env.services.ui.unblock();
                });

                return _do_ssh_scp(url)
            }
            if (default_print_option === "open") {
                window.open(url);
            }
            return true;
        } else {
            // open the report in the client action if generating the PDF is not possible
            return _executeReportClientAction(action, options);
        }
    })
