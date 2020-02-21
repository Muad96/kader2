// Copyright (c) 2016, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('HR Settings', {
	salary_structure: function(frm) {
		frappe.call({
					"method": "complement.complement.tools.set_salary_structure_for_all",
					args: {doc:frm.doc},
					callback: function (data) {
						console.log(data);
					}
			});
	}
});
