import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: '0c77pf58',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-05-03',
})

const builder = imageUrlBuilder(client)

export const urlFor = (source) => builder.image(source)

export const urgentNeedsQuery = `*[_type == "urgentNeed"] | order(_createdAt desc)`
export const residentStoriesQuery = `*[_type == "residentStory" && featured == true] | order(_createdAt desc)[0...3]`
export const galleryImagesQuery = `*[_type == "galleryImage"] | order(_createdAt desc)`

export const volunteersQuery = `*[_type == "volunteer"] | order(_createdAt desc)`
export const pendingVolunteersQuery = `*[_type == "volunteer" && status == "pending"] | order(_createdAt desc)`
export const activeVolunteersQuery = `*[_type == "volunteer" && status == "active"] | order(joinDate desc)`
