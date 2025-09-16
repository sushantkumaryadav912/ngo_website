export default {
  name: 'urgentNeed',
  title: 'Urgent Need',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'targetAmount',
      title: 'Target Amount (₹)',
      type: 'number',
      validation: Rule => Rule.required().positive()
    },
    {
      name: 'raisedAmount',
      title: 'Raised Amount (₹)',
      type: 'number',
      initialValue: 0
    },
    {
      name: 'isUrgent',
      title: 'Mark as Urgent',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Medical', value: 'medical'},
          {title: 'Food & Groceries', value: 'food'},
          {title: 'Infrastructure', value: 'infrastructure'},
          {title: 'Utilities', value: 'utilities'},
          {title: 'Other', value: 'other'}
        ]
      }
    },
    {
      name: 'endDate',
      title: 'Campaign End Date',
      type: 'datetime'
    }
  ],
  preview: {
    select: {
      title: 'title',
      raised: 'raisedAmount',
      target: 'targetAmount',
      urgent: 'isUrgent'
    },
    prepare(selection) {
      const {title, raised, target, urgent} = selection
      const percentage = Math.round((raised / target) * 100)
      const urgentIcon = urgent ? '🚨 ' : ''
      
      return {
        title: `${urgentIcon}${title}`,
        subtitle: `₹${raised?.toLocaleString() || 0} / ₹${target?.toLocaleString() || 0} (${percentage}%)`
      }
    }
  }
}
