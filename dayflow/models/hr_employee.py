from odoo import models, fields


class HrEmployee(models.Model):
    _inherit = "hr.employee"

    onboarding_completed = fields.Boolean(string="Onboarding Completed", default=False)
    onboarding_date = fields.Date(string="Onboarding Date")
