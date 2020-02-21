from frappe import _

def get_data():
	return {
		'transactions': [
			{
				'label': _('Insured Vehicle'),
				'items': ['Vehicle']
			}
		]
	}