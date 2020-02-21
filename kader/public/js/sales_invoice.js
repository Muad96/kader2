
frappe.ui.form.on('Sales Invoice', {
	project: function(frm) {
    if(frm.doc.project){
    frm.call({
			method: "complement.complement.tools.add_timesheet_summary",
			args: {
        project:frm.doc.project
      },
			callback: function(r) {
          frm.doc.timesheets =[];
          $.each(r.message,function(indix,row) {
            var new_row = frm.add_child("timesheets");
                new_row.time_sheet = row.name;
                new_row.billing_amount = row.total_billable_amount;
                new_row.billing_hours = row.total_billable_hours;
          });
        refresh_field('timesheets');
        calculate_total_billing_amount(frm)
			}
		});
  }
      }
	});
