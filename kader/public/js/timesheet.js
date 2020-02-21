
frappe.ui.form.on('Timesheet', {
  setup: function(frm) {
		frm.add_fetch('employee', 'employee_number', 'employee_number');
  },
  add_monthly: function(frm) {
    if(cur_frm.get_field("time_logs").grid.grid_rows){
    cur_frm.get_field("time_logs").grid.grid_rows[0].remove();
  }
    refresh_field("time_logs");
    var dialog = new frappe.ui.Dialog({
      title: __("Set Timesheet"),
      fields: [
        {
          "fieldtype": "Link",
          "label": __("Activity Type"),
          "fieldname": "activity_type",
          "options": "Activity Type",
          "reqd": 1
        }, {
          "fieldtype": "Int",
          "label": __("Hrs"),
          "fieldname": "hours",
          "reqd": 1
        }, {
          "fieldtype": "Date",
          "label": __("From Date"),
          "fieldname": "from_date",
          "reqd": 1
        }, {
          "fieldtype": "Date",
          "label": __("To Date"),
          "fieldname": "to_date",
          "reqd": 1
        }, {
          "fieldtype": "Link",
          "label": __("Project"),
          "fieldname": "project",
          "options": "Project",
          "reqd": 1
        }, {
          "fieldtype": "Check",
          "label": __("Bill"),
          "fieldname": "billable"
        }, {
          "fieldtype": "Currency",
          "label": __("Billing Rate"),
          "fieldname": "billing_rate",
          "reqd": 1
        }, {
          "fieldtype": "Currency",
          "label": __("Costing Rate"),
          "fieldname": "costing_rate",
          "reqd": 1
        },{
          "fieldtype": "Button",
          "label": __("Fill"),
          "fieldname": "fill"
        }
      ]
    });

    dialog.fields_dict.fill.$input.click(function() {
      var args = dialog.get_values();
      let days = frappe.datetime.get_day_diff(args.to_date, args.from_date); // returns the days between 2 dates
      days = days + 1;
			var _date = args.from_date;
      for (var i = 1; i <= days; i++) {
        var dt = new Date(_date);
				dt.setHours(7);
        switch (dt.getDay()) {
          case 5:
            // console.log("saturday!");
            break;
          default:
            add_row(frm, args.activity_type, args.hours, dt, args.project, args.billable, args.billing_rate, args.costing_rate);
        }
				  _date = frappe.datetime.add_days(args.from_date, i); // add n days to a date
      }
			  refresh_field("time_logs");
				calculate_time_and_amount(frm);
				dialog.hide();
        frm.set_value("project",args.project);
        refresh_field("project");
        frm.set_value("billable",args.billable);
        refresh_field("billable");
    });
		// calculate_end_time(frm, cdt, cdn);
    dialog.show();
  }
});

function add_row(frm, activity_type, hours, date, project, billable,billing_rate,costing_rate) {
  var new_row = frm.add_child("time_logs");
  new_row.activity_type = activity_type;
  new_row.hours = hours;
  new_row.from_time = date;
  new_row.to_time =  moment(date).add(hours, 'h').toDate();
  new_row.project = project;
  new_row.billable = billable;
	if(billable){
		new_row.billing_hours = hours;
	}
	new_row.billing_rate = billing_rate;
	new_row.costing_rate = costing_rate;
  new_row.billing_amount = billing_rate * hours;
	new_row.costing_amount = costing_rate * hours;
}
