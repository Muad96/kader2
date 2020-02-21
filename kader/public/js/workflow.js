String.prototype.replaceAll = function(target, replacement) {
  return this.split(target).join(replacement);
};

frappe.ui.form.on("Workflow", {
  copy: function(frm) {
    if (frm.doc.old_workflow && (frm.doc.old_states || frm.doc.old_transitions)) {
      frappe.call({
        method: "frappe.client.get",
        args: {
          "doctype": "Workflow",
          "name": frm.doc.old_workflow
        },
        callback: function(r) {
          var states = r.message.states;
          var transitions = r.message.transitions;
          var email_state = r.message.email_state;
          if (frm.doc.old_states) {
            frm.doc.states = [];
            frm.refresh_field("states");
            $.each(states, function(index, value) {
              row = frm.add_child("states");
              row.allow_edit = value.allow_edit;
              row.docstatus = value.docstatus;
              row.update_field = value.update_field;
              row.update_value = value.update_value;
              row.state = value.state;
            });
            frm.refresh_field("states");
          }
          if (frm.doc.old_transitions) {
            frm.doc.transitions = [];
            frm.refresh_field("transitions");
            $.each(transitions, function(index, value) {
              row = frm.add_child("transitions");
              row.action = value.action;
              row.allowed = value.allowed;
              row.state = value.state;
              row.next_state = value.next_state;
            });
            frm.refresh_field("transitions");
          }
          if (frm.doc.old_email) {
            frm.doc.email_state = [];
            $.each(email_state, function(index, value) {
              row = frm.add_child("email_state");
              row.state = value.state;
              row.email_by_role = value.email_by_role;
              row.email_by_document_field = value.email_by_document_field;
              row.subject = value.subject;
              row.message = value.message;
            });
            frm.refresh_field("email_state");
          }
        }
      });
    }
  },
  create: function(frm) {
    // console.log("insert_list:", cur_frm.doc.email_state);
    document_type = frm.doc.document_type;
    return frappe.call({
      "method": "complement.complement.tools.insert_email_alert",
      args: {
        "insert_list": cur_frm.doc.email_state,
        "document_type": document_type
      },
      callback: function(data) {
        console.log(data);
      }
    });
  },
  save: function(frm) {
    if (frm.doc.make_custom_report) {
      frappe.call({
        method: "frappe.client.insert",
        args: {
          doc: {
            doctype: "Print Format",
            name: frm.doc.document_type,
            standard: "No",
            doc_type: frm.doc.document_type,
            print_format_builder: 1,
            align_labels_left: 1
          }
        },
        callback: function(r) {
          // console.log("r:", r);
        }
      });
      setTimeout(function() { // it is not working - I hava to isert new record in Property Setter
        frappe.call({
          method: "frappe.print.doctype.print_format.print_format.make_default",
          args: {
            name: frm.doc.document_type
          }
        });
      }, 150);
    }

    if (frm.doc.add_signature_to_workflow) {
      var issuer_temp = "";
      var templates = "";
      var print = "";
      if (frm.doc.with_issuer) {
        issuer_temp = "{% set issuer = frappe.get_all('User', fields=['full_name','signature'], \n" +
          "filters = {'email':doc.owner})%} \n" +
          "<tr>\n" +
          "<td class='table-sr' style='vertical-align: middle !important;'>\n" +
          "<strong>{{_('Line Manager')}}<strong></td>\n" +
          "<td style='vertical-align: middle !important;' data-fieldtype='Table'>\n" +
          "<div class='value'>\n" +
          "{{_(issuer[0].full_name) or '' }}\n" +
          "</div>\n" +
          "</td>\n" +
          "<td style='vertical-align: middle !important;text-align: center;' data-fieldtype='Table'>\n" +
          "<div class='value'>\n" +
          "<img src='{{issuer[0].signature}}' style='width: 45% !important;'>\n" +
          "</div>\n" +
          "</td>\n" +
          "</tr>\n";
      }
      templates = "{% set $N = frappe.get_all('Communication', fields=['sender_full_name']," +
        "filters = {'reference_name':doc.name,'reference_doctype':doc.doctype,'subject':'$J'})%}\n" +
        "{% if ($N is defined) and $N %}\n" +
        "{% set $N_sign = frappe.get_all('User', fields=['signature']," +
        "filters = {'full_name':$N[0].sender_full_name})%}\n" +
        "{% endif %}\n" +
        "<tr>\n" +
        "<td class='table-sr' style='vertical-align: middle !important;'>\n" +
        "<strong>{{_('$S')}}<strong></td>\n" +
        "<td style='vertical-align: middle !important;' data-fieldtype='Table'>\n" +
        "<div class='value'>\n" +
        "{{_($N[0].sender_full_name) or '' }}\n" +
        "</div>\n" +
        "</td>\n" +
        "<td style='vertical-align: middle !important;text-align: center;' data-fieldtype='Table'>\n" +
        "<div class='value'>\n" +
        "<img src='{{$N_sign[0].signature}}' style='width: 45% !important;'>\n" +
        "</div>\n" +
        "</td>\n" +
        "</tr>\n";

      var trns = frm.doc.transitions;
      trns = jQuery.grep(trns, function(n, i) {
        return (n.action == "Approve");
      });
      trns.unshift(frm.doc.transitions[0]);
      // console.log("trns.length = ", trns.length);
      for (var i = 0; i < trns.length; i++) {
        if (trns[i + 1]) {
          var state = trns[i].next_state;
          var subject = trns[i + 1].next_state;
          var x = templates.replaceAll('$S', state);
          x = x.replaceAll('$J', subject);
          x = x.replaceAll("<strong>{{_('Pending for ", "<strong>{{_('");
                    var role = trns[i].allowed;
                    role = role.split(' ').join('_').toLowerCase();
                    x = x.replaceAll('$N', role);
                    // console.log("state: " + state + " subject: " + subject + " role: " + role);
                    print = print.concat(x);
                    print = print.concat("\n");
                }
            }

            var table = "{% if doc.workflow_state == 'Approved' %}\n" +
                "<table id='sign' class='table table-bordered table-condensed'>\n" +
                "<thead>\n" +
                "<tr>\n" +
                "<th style='width: 150px; vertical-align: middle !important;' class='table-sr'>" +
                "{{_('Approved by')}}</th>\n" +
                "<th style='width: 150px; vertical-align: middle !important;' data-fieldtype='Table'>\n" +
                "{{_('Name')}}</th>\n" +
                "<th style='width: 150px; vertical-align: middle !important;text-align: center;' data-fieldtype='Table'>\n" +
                "{{_('Signature')}}</th>\n" +
                "</tr>\n" +
                "</thead>\n" +
                "<tbody>\n" +
                issuer_temp +
                "\n"+
                print +
                "\n"+
                "</tbody>\n" +
                "</table>\n" +
                "{% endif %}\n";

            frappe.call({
                method: "complement.complement.tools.add_signature",
                args: {
                    document_type: frm.doc.document_type,
                    value: table,
                },
                callback: function(r) {}
            });
        }
        if(frm.doc.add_rejected_reason){
          //add rejected field
          frappe.call({
              method: "complement.complement.tools.add_rejected_field",
              args: {
                  document_type: frm.doc.document_type
              },
              callback: function(r) {}
          });
          /*jshint multistr: true */
          var code = "frappe.ui.form.on('" + frm.doc.document_type + "', {\n\
                  after_save: function(frm) {\n\
                      if (frm.doc.workflow_state && \n\
                        frm.doc.workflow_state.indexOf('Rejected') >= 0 && \n\
                        frm.doc.rejected_reason == undefined) {\n\
                          frappe.prompt([{\n\
                                  fieldtype: 'Small Text',\n\
                                  reqd: true,\n\
                                  fieldname: 'reason'\n\
                              }],\n\
                              function(args) {\n\
                                frappe.call({\n\
                                    method: 'frappe.client.set_value',\n\
                                    args: {\n\
                                        doctype: frm.doctype,\n\
                                        name: frm.docname,\n\
                                        fieldname: 'rejected_reason',\n\
                                        value: args.reason \n\
                                    },\n\
                                    callback: function(res) {\n\
                                        if (res && !res.exc) {\n\
                                            frm.reload_doc();\n\
                                        }\n\
                                    }\n\
                                });\n\
                              },\n\
                              __('Reason for ') + __(frm.doc.workflow_state),\n\
                              __('End as Rejected')\n\
                          );\n\
                      }\n\
                  }\n\
                });";

                //add Reject Email template
                frappe.call({
                    method: "frappe.client.insert",
                    args: {
                        doc: {
                            doctype: "Custom Script",
                            dt: frm.doc.document_type,
                            script: code,
                        }
                    },
                    callback: function(r) {
                      msgprint(__("Reject Email template Cretaed"));
                        // console.log("r:", r);
                    }
                });
        }
    }
});
