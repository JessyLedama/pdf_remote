# -*- coding: utf-8 -*-
{
    'name': 'Remote PDF',
    'summary': """copy file from local folder to remote folder, and vice versa.""",
    'description': """
        When you download a file to a specified folder, it is copied to a remote location, and can be copied from remote location back to a specified local directory.
    """,
    'author': 'Jessy Ledama',
    'category': 'Productivity',
    'images': ['images/main_1.png', 'images/main_screenshot.png'],
    'depends': ['web', 'base'],
    'data': [
        'views/ir_actions_report.xml',
    ],
    'installable': True,
    'auto_install': False,
    'license': 'LGPL-3',
    'assets': {
        'web.assets_qweb': [
            'report_pdf_options/static/src/**/*.xml',
        ],
        'web.assets_backend': [
            'report_pdf_options/static/src/js/PdfOptionsModal.js',
            'report_pdf_options/static/src/js/qwebactionmanager.js',
        ]
    }
}
