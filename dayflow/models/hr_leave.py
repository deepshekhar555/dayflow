from odoo import models, fields


class HrLeave(models.Model):
    _inherit = "hr.leave"

    dayflow_remarks = fields.Text(string="HR Remarks")
