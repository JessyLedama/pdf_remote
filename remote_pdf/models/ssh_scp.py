from paramiko import SSHClient
from scp import SCPClient

class SSHSCP(models.Model):
    _name = "ssh.scp"
    _description = "Send Invoice To Remote Location"

    host=fields.Char(string="Host IP", required=True)
    username=fields.Char(string="Username", required=True)
    password=fields.Char(string="Password", required=True)

    def _do_ssh_scp():
        ssh = SSHClient()
        ssh.load_system_host_keys()
        ssh.connect('153.92.223.238', username='root', password='#No.new.news.22.#')

        # SCPCLient takes a paramiko transport as an argument
        scp = SCPClient(ssh.get_transport())

        # send file to remote server.
        scp.put('test.txt', remote_path='/demos')

        scp.close()