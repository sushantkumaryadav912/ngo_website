export default {
  name: 'volunteer',
  title: 'Volunteer',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'age',
      title: 'Age',
      type: 'number',
      validation: Rule => Rule.required().min(16).max(80)
    },
    {
      name: 'skills',
      title: 'Skills & Interests',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Healthcare/Medical', value: 'healthcare'},
          {title: 'Cooking', value: 'cooking'},
          {title: 'Entertainment/Music', value: 'entertainment'},
          {title: 'Gardening', value: 'gardening'},
          {title: 'Teaching/Education', value: 'teaching'},
          {title: 'Technology Support', value: 'technology'},
          {title: 'Transportation', value: 'transportation'},
          {title: 'Administrative', value: 'administrative'},
          {title: 'Event Planning', value: 'events'},
          {title: 'Fundraising', value: 'fundraising'}
        ]
      }
    },
    {
      name: 'availability',
      title: 'Availability',
      type: 'object',
      fields: [
        {
          name: 'days',
          title: 'Available Days',
          type: 'array',
          of: [{type: 'string'}],
          options: {
            list: [
              {title: 'Monday', value: 'monday'},
              {title: 'Tuesday', value: 'tuesday'},
              {title: 'Wednesday', value: 'wednesday'},
              {title: 'Thursday', value: 'thursday'},
              {title: 'Friday', value: 'friday'},
              {title: 'Saturday', value: 'saturday'},
              {title: 'Sunday', value: 'sunday'}
            ]
          }
        },
        {
          name: 'timeSlot',
          title: 'Preferred Time Slot',
          type: 'string',
          options: {
            list: [
              {title: 'Morning (9 AM - 12 PM)', value: 'morning'},
              {title: 'Afternoon (12 PM - 4 PM)', value: 'afternoon'},
              {title: 'Evening (4 PM - 8 PM)', value: 'evening'},
              {title: 'Flexible', value: 'flexible'}
            ]
          }
        }
      ]
    },
    {
      name: 'experience',
      title: 'Previous Volunteer Experience',
      type: 'text'
    },
    {
      name: 'motivation',
      title: 'Why do you want to volunteer?',
      type: 'text',
      validation: Rule => Rule.required()
    },
    {
      name: 'status',
      title: 'Application Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending Review', value: 'pending'},
          {title: 'Approved', value: 'approved'},
          {title: 'Rejected', value: 'rejected'},
          {title: 'Active', value: 'active'},
          {title: 'Inactive', value: 'inactive'}
        ]
      },
      initialValue: 'pending'
    },
    {
      name: 'joinDate',
      title: 'Application Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    },
    {
      name: 'emergencyContact',
      title: 'Emergency Contact',
      type: 'object',
      fields: [
        {name: 'name', title: 'Contact Name', type: 'string'},
        {name: 'relationship', title: 'Relationship', type: 'string'},
        {name: 'phone', title: 'Phone Number', type: 'string'}
      ]
    }
  ]
}
