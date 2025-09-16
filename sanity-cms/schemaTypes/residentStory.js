export default {
  name: 'residentStory',
  title: 'Resident Story',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Story Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'residentName',
      title: 'Resident Name',
      type: 'string'
    },
    {
      name: 'age',
      title: 'Age',
      type: 'number'
    },
    {
      name: 'story',
      title: 'Story Content',
      type: 'array',
      of: [{type: 'block'}]
    },
    {
      name: 'image',
      title: 'Resident Photo',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'featured',
      title: 'Featured Story',
      type: 'boolean',
      initialValue: false
    }
  ]
}
