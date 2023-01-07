from numpy import require
from paramiko import SSHClient
from scp import SCPClient

class SSHSCP(models.Model):
    _name = "ssh.scp"
    _description = "Send Invoice To Remote Location"

    owner_id = Many2one(res.users, ondelete='set null', domain=lambda self: [('res_id', 'in', self.env.user.id)])
    host=fields.Char(string="Host IP", required=True)
    username=fields.Char(string="Username", required=True)
    password=fields.Char(string="Password", required=True)


    localIn = fields.Char(string="Local IN directory", required=True)
    localOut = fields.Char(string="Local OUT directory", required=True)

    remoteIn = fields.Char(string="Remote IN directory", required=True)
    remoteOut = fields.Char(string="Remote OUT directory", required=True)

    def _getCurrentUser():
        self.user_id = self.env.uid


    def _do_ssh_scp():
        ssh = SSHClient()
        ssh.load_system_host_keys()
        ssh.connect('153.92.223.238', username='root', password='#No.new.news.22.#')

        # SCPCLient takes a paramiko transport as an argument
        scp = SCPClient(ssh.get_transport())

        # send file to remote server.
        scp.put('test.txt', remote_path='/demos')

        scp.close()