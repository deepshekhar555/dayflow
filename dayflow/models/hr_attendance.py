from odoo import models, fields, api


class HrAttendance(models.Model):
    _inherit = "hr.attendance"

    status = fields.Selection([
        ("present", "Present"),
        ("absent", "Absent"),
        ("half_day", "Half Day"),
        ("leave", "Leave"),
    ], string="Status", compute="_compute_status", store=True)

    @api.depends("check_in", "check_out")
    def _compute_status(self):
        for rec in self:
            rec.status = "present" if rec.check_in else "absent"
