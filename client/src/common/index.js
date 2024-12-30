const backendDomin = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const SummaryApi = {
  register: {
    url: `${backendDomin}/api/users/register`,
    method: "post",
  },
  login: {
    url: `${backendDomin}/api/users/login`,
    method: "post"
  },
  logout: {
    url: `${backendDomin}/api/users/logout`,
    method: "post"
  },
  profile:{
    url: `${backendDomin}/api/users/profile`,
    method: "get"
  },
  update_profile: {
    url: `${backendDomin}/api/users/update-profile`,
    method: "patch"
  },
  getVideos: {
    url: `${backendDomin}/api/videos`,
    method: "get"
  },
  trendingVideos: {
    url: `${backendDomin}/api/videos/trending`,
    method: "get",
  },
  uploadVideo: {
    url: `${backendDomin}/api/videos/upload`,
    method: "post"
  },
  getBlogs: {
    url: `${backendDomin}/api/blogs`,
    method: "get",
  },
  featuredBlogs: {
    url: `${backendDomin}/api/blogs/featured`,
    method: "get"
  },
  createBlog: {
    url: `${backendDomin}/api/blogs/create`,
    method: "post"
  },
  defaultUrl: backendDomin
};

export default SummaryApi;
