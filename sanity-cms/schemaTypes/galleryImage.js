export default {
  name: 'galleryImage',
  title: 'Gallery Image',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Image Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description: 'Important for accessibility and SEO'
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Daily Life', value: 'daily'},
          {title: 'Activities', value: 'activities'},
          {title: 'Events', value: 'events'},
          {title: 'Facilities', value: 'facilities'},
          {title: 'Residents', value: 'residents'},
          {title: 'Volunteers', value: 'volunteers'}
        ]
      }
    },
    {
      name: 'featured',
      title: 'Featured Image',
      type: 'boolean',
      description: 'Show this image prominently',
      initialValue: false
    },
    {
      name: 'dateAdded',
      title: 'Date Added',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image'
    }
  }
}
