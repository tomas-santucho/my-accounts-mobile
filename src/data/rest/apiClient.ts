export const apiClient = {
  post: async (url: string, data: any) => {
    console.log(`Mock API call to ${url} with data:`, data)
    return { status: 200 }
  },
}
