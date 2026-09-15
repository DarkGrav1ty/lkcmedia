export type ServicePage = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  details: string[];
  galleryLabel: string;
  galleryHref: string;
  related: string[];
};

export const servicePages: ServicePage[] = [
  {
    slug: "sports-photography",
    eyebrow: "Sports Photography",
    title: "Arizona Sports Photographer",
    description:
      "Sports photography by LKC Media in Arizona, including individual athletes, teams, games, and sporting events.",
    heading: "Sports photography built around the moments that matter.",
    intro:
      "LKC Media photographs athletes, teams, games, and sporting events across Arizona with a focus on real action, emotion, and the moments worth keeping.",
    details: [
      "Individual athlete coverage for players who want professional images from their sport.",
      "Game and event coverage focused on action, reactions, celebrations, and the atmosphere around the competition.",
      "Team coverage for organizations looking for a consistent set of images from a game or event.",
      "Published work is available through LKC Media galleries, with private client galleries available when a shoot requires restricted access.",
    ],
    galleryLabel: "View Sports Galleries",
    galleryHref: "/gallery",
    related: [
      "football-photography",
      "basketball-photography",
      "baseball-photography",
      "soccer-photography",
      "individual-athlete-photography",
      "team-event-photography",
    ],
  },
  {
    slug: "portrait-photography",
    eyebrow: "Portrait Photography",
    title: "Arizona Portrait Photographer",
    description:
      "Portrait photography by LKC Media in Arizona with natural, purposeful images focused on the person in front of the camera.",
    heading: "Portraits that feel like you.",
    intro:
      "LKC Media offers portrait photography in Arizona with an approach centered on natural moments, strong images, and a comfortable experience in front of the camera.",
    details: [
      "Portrait sessions are built around the person being photographed rather than a one-size-fits-all look.",
      "Sessions can focus on individual portraits and other portrait concepts that fit LKC Media's photography style.",
      "Final images are professionally edited and delivered digitally.",
      "Portrait availability and session details can be discussed through the LKC Media booking form.",
    ],
    galleryLabel: "View Portrait Galleries",
    galleryHref: "/gallery",
    related: [],
  },
  {
    slug: "football-photography",
    eyebrow: "Football Photography",
    title: "Arizona Football Photographer",
    description:
      "Football photography by LKC Media in Arizona for individual athletes, games, teams, and football events.",
    heading: "Football photography from the field to the final whistle.",
    intro:
      "LKC Media photographs football with a focus on the speed, physicality, emotion, and individual moments that define a game.",
    details: [
      "Action coverage can follow individual athletes or the larger story of a game.",
      "Coverage focuses on plays, reactions, sideline moments, celebrations, and details around the event.",
      "Individual athlete packages are available for players looking for a defined number of edited images.",
      "Team and event coverage is quoted based on the scope of the assignment.",
    ],
    galleryLabel: "Explore Sports Galleries",
    galleryHref: "/gallery",
    related: [
      "sports-photography",
      "individual-athlete-photography",
      "team-event-photography",
    ],
  },
  {
    slug: "basketball-photography",
    eyebrow: "Basketball Photography",
    title: "Arizona Basketball Photographer",
    description:
      "Basketball photography by LKC Media in Arizona for athletes, games, teams, and basketball events.",
    heading: "Basketball photography focused on action and emotion.",
    intro:
      "LKC Media photographs basketball with attention to the fast moments that make the game memorable, from individual plays to reactions around the court.",
    details: [
      "Coverage can focus on a specific athlete or document a broader game or event.",
      "Images are selected and edited to highlight strong action, emotion, and memorable moments.",
      "Individual athlete packages are available when a player wants dedicated coverage.",
      "Team and event photography is available through a custom quote.",
    ],
    galleryLabel: "Explore Sports Galleries",
    galleryHref: "/gallery",
    related: [
      "sports-photography",
      "individual-athlete-photography",
      "team-event-photography",
    ],
  },
  {
    slug: "baseball-photography",
    eyebrow: "Baseball Photography",
    title: "Arizona Baseball Photographer",
    description:
      "Baseball photography by LKC Media in Arizona for individual athletes, games, teams, and baseball events.",
    heading: "Baseball photography for the plays between the pitches.",
    intro:
      "LKC Media photographs baseball with a focus on game action, athletes, reactions, and the smaller moments that help tell the story of the game.",
    details: [
      "Coverage can follow an individual player or document the larger game.",
      "Photography can include action, dugout moments, celebrations, and other parts of the event.",
      "Individual athlete packages provide a defined set of professionally edited images.",
      "Team and event assignments are handled through custom quotes based on coverage needs.",
    ],
    galleryLabel: "Explore Sports Galleries",
    galleryHref: "/gallery",
    related: [
      "sports-photography",
      "individual-athlete-photography",
      "team-event-photography",
    ],
  },
  {
    slug: "soccer-photography",
    eyebrow: "Soccer Photography",
    title: "Arizona Soccer Photographer",
    description:
      "Soccer photography by LKC Media in Arizona for athletes, matches, teams, and soccer events.",
    heading: "Soccer photography that follows the movement of the match.",
    intro:
      "LKC Media photographs soccer with a focus on athletes in motion, decisive plays, reactions, celebrations, and the energy surrounding the match.",
    details: [
      "Coverage can be centered on an individual athlete or a broader match or event.",
      "Images are selected around meaningful action and moments rather than simply documenting every play.",
      "Individual athlete packages are available for dedicated player coverage.",
      "Team and event assignments are quoted according to the scope of coverage.",
    ],
    galleryLabel: "Explore Sports Galleries",
    galleryHref: "/gallery",
    related: [
      "sports-photography",
      "individual-athlete-photography",
      "team-event-photography",
    ],
  },
  {
    slug: "individual-athlete-photography",
    eyebrow: "Individual Athlete Photography",
    title: "Individual Athlete Photography in Arizona",
    description:
      "Individual athlete sports photography by LKC Media in Arizona with dedicated game coverage and professionally edited images.",
    heading: "Your game. Your moments. Your photos.",
    intro:
      "Individual athlete coverage is designed for players who want the camera focused on their performance instead of hoping they appear in general event coverage.",
    details: [
      "Coverage focuses specifically on the athlete throughout the scheduled game or event.",
      "LKC Media selects and edits the strongest moments from the coverage.",
      "Current individual sports options include 5 edited photos for $10, 10 for $25, 20 for $45, and 30 for $55.",
      "Travel charges may apply based on travel time to the shoot location.",
    ],
    galleryLabel: "See Published Work",
    galleryHref: "/gallery",
    related: [
      "sports-photography",
      "football-photography",
      "basketball-photography",
      "baseball-photography",
      "soccer-photography",
    ],
  },
  {
    slug: "team-event-photography",
    eyebrow: "Team & Event Photography",
    title: "Team & Sports Event Photography in Arizona",
    description:
      "Team and sports event photography by LKC Media in Arizona with custom coverage based on the event and organization.",
    heading: "Coverage for the bigger picture.",
    intro:
      "LKC Media provides team and sports event photography when the assignment needs broader coverage than an individual athlete package.",
    details: [
      "Coverage can document athletes, action, reactions, celebrations, and the overall atmosphere of the event.",
      "The exact scope can be planned around the team, organization, game, or event.",
      "Team and event photography is custom quoted rather than forced into an individual-athlete package.",
      "Use the booking form to provide the event details and coverage needs.",
    ],
    galleryLabel: "View Galleries",
    galleryHref: "/gallery",
    related: [
      "sports-photography",
      "individual-athlete-photography",
      "football-photography",
      "basketball-photography",
      "baseball-photography",
      "soccer-photography",
    ],
  },
];

export function getServicePage(slug: string) {
  return servicePages.find((service) => service.slug === slug);
}