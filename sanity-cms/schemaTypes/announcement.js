export default {
  name: 'announcement',
  title: 'Announcement',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Announcement Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{type: 'block'}],
      validation: Rule => Rule.required()
    },
    {
      name: 'type',
      title: 'Announcement Type',
      type: 'string',
      options: {
        list: [
          {title: 'General Info', value: 'info'},
          {title: 'Important Notice', value: 'important'},
          {title: 'Event', value: 'event'},
          {title: 'Emergency', value: 'emergency'},
          {title: 'Celebration', value: 'celebration'}
        ]
      },
      initialValue: 'info'
    },
    {
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          {title: 'Low', value: 'low'},
          {title: 'Medium', value: 'medium'},
          {title: 'High', value: 'high'},
          {title: 'Urgent', value: 'urgent'}
        ]
      },
      initialValue: 'medium'
    },
    {
      name: 'publishDate',
      title: 'Publish Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    },
    {
      name: 'expiryDate',
      title: 'Expiry Date',
      type: 'datetime',
      description: 'When should this announcement stop being displayed?'
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Show this announcement on the website',
      initialValue: true
    },
    {
      name: 'showOnHomepage',
      title: 'Show on Homepage',
      type: 'boolean',
      description: 'Display this announcement prominently on the homepage',
      initialValue: false
    }
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      priority: 'priority',
      active: 'isActive'
    },
    prepare(selection) {
      const {title, type, priority, active} = selection
      const statusIcon = active ? '✅' : '❌'
      const priorityIcon = priority === 'urgent' ? '🚨' : priority === 'high' ? '🔴' : '📢'
      
      return {
        title: `${statusIcon} ${title}`,
        subtitle: `${priorityIcon} ${type} - ${priority} priority`
      }
    }
  }
}
