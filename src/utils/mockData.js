export const mockSearchData = [
  {
    id: 1,
    name: "John Smith",
    title: "Senior Software Engineer",
    linkedin_url: "https://linkedin.com/in/johnsmith",
    city: "San Francisco",
    state: "CA",
    organization: {
      name: "Tech Corp",
      logo_url: "https://avatar.vercel.sh/techcorp.png?size=32",
      linkedin_url: "https://linkedin.com/company/techcorp",
      website_url: "https://techcorp.com"
    }
  },
  {
    id: 2,
    name: "Sarah Johnson",
    title: "Product Manager",
    linkedin_url: "https://linkedin.com/in/sarahjohnson",
    city: "New York",
    state: "NY",
    organization: {
      name: "Innovation Inc",
      logo_url: "https://avatar.vercel.sh/innovationinc.png?size=32",
      linkedin_url: "https://linkedin.com/company/innovationinc",
      website_url: "https://innovationinc.com"
    }
  },
  {
    id: 3,
    name: "Mike Davis",
    title: "Marketing Director",
    linkedin_url: "https://linkedin.com/in/mikedavis",
    city: "Austin",
    state: "TX",
    organization: {
      name: "Growth Solutions",
      logo_url: "https://avatar.vercel.sh/growthsolutions.png?size=32",
      linkedin_url: "https://linkedin.com/company/growthsolutions",
      website_url: "https://growthsolutions.com"
    }
  }
];

export const mockPagination = {
  page: 1,
  total_pages: 1,
  total_entries: 3,
  per_page: 10
};
