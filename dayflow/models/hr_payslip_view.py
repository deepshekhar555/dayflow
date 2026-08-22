from odoo import models, fields, api


class DayflowPayroll(models.Model):
    _name = "dayflow.payroll"
    _description = "Employee Payroll"

    employee_id = fields.Many2one("hr.employee", string="Employee", required=True)
    basic_salary = fields.Float(string="Basic Salary")
    allowances = fields.Float(string="Allowances")
    deductions = fields.Float(string="Deductions")
    net_salary = fields.Float(string="Net Salary", compute="_compute_net_salary", store=True)

    @api.depends("basic_salary", "allowances", "deductions")
    def _compute_net_salary(self):
        for rec in self:
            rec.net_salary = rec.basic_salary + rec.allowances - rec.deductions
