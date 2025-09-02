import { Header } from "@/components/Header";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Target,
  Heart,
  Users,
  Award,
  Leaf,
  Globe,
  TrendingUp,
  Shield,
  Car,
  MapPin,
  Star,
  Icon,
  CarFront,
  HandCoinsIcon,
  Building2,
  Map,
  UserCog2,
  GlobeLockIcon,
  LecternIcon,
  Satellite,
  LeafyGreenIcon,
  HeartHandshake,
  LeafIcon,
} from "lucide-react";

const About = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const stats = [
    { label: "Cities Served", value: "2+", icon: MapPin },
    { label: "Happy Customers", value: "2.1K+", icon: Users },
    { label: "Electric Vehicles", value: "5+", icon: Car },
    { label: "Zero Emissions", value: "100%", icon: Leaf },
    { label: "Customer Rating", value: "4.8★", icon: Star },
    { label: "CO₂ Saved", value: "10K+ tons", icon: Globe },
  ];

  const values = [
    {
      icon: LeafIcon,
      title: "Sustainability",
      description:
        "Committed to zero-emission transportation and environmental protection through 100% electric fleet.",
    },
    {
      icon: Shield,
      title: "Safety First",
      description:
        "Prioritizing passenger safety with verified drivers, real-time tracking, and 24/7 support.",
    },
    {
      icon: Users,
      title: "Customer-Centric",
      description:
        "Putting customers at the heart of everything we do with transparent pricing and quality service.",
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description:
        "Leading the future of mobility with cutting-edge technology and smart transportation solutions.",
    },
    {
      icon: Heart,
      title: "Community Impact",
      description:
        "Contributing to cleaner cities and better quality of life for urban communities.",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "Maintaining highest standards in service quality, vehicle maintenance, and customer experience.",
    },
  ];

  const timeline = [
    {
      // year: "2020",
      icon: <CarFront />,
      title: "100% Electric Fleet",
      description:
        "Unlike traditional operators, we are fully committed to electric vehicles, ensuring zero emissions and a greener Mysuru.",
    },
    {
      // year: "2021",
      icon: <HandCoinsIcon />,
      title: "Affordability & Transparency",
      description:
        "Competitive flat fares with no hidden costs, enabled by lower EV operating expenses.",
    },
    {
      // year: "2022",
      icon: <Building2 />,
      title: "Corporate-Centric Model",
      description:
        "We focus not only on public riders but also on long-term corporate contracts, ensuring recurring and predictable revenues.",
    },
    {
      // year: "2023",
      icon: <Map />,
      title: "Local Expertise",
      description:
        "As a Mysuru-born company, we deeply understand the mobility needs of residents, tourists, and businesses in the city.",
    },
    {
      // year: "2024",
      icon: <UserCog2 />,
      title: "Driver Empowerment",
      description:
        "We treat our drivers as partners by providing fair payouts, training, and incentives, ensuring better service quality.",
    },
    {
      // year: "2025",
      icon: <GlobeLockIcon />,
      title: "Technology Integration",
      description:
        "Real-time booking, tracking, WhatsApp-based support, and CRM-enabled lead management.",
    },
    {
      icon: <LeafIcon />,
      title: "Sustainability Impact",
      description:
        "Each ride directly contributes to reducing carbon emissions, and corporates partnering with us can showcase measurable ESG impact.",
    },
  ];

  const team = [
    {
      name: "Mr.Shashi Kumar",
      role: "CEO & Founder",
      description:
        "15+ years in automotive industry, passionate about sustainable transportation",
      image: "public/img/shashi.png",
    },
    {
      name: "Mr.Chirag R",
      role: "CFO & Co-Founder",
      description:
        "Experience: 9+ years in finance and operations, driving financial strategy and growth",
      image: "public/img/chirag.png",
    },
    // {
    //   name: "Amit Patel",
    //   role: "Head of Operations",
    //   description: "Operations expert ensuring seamless service delivery across all cities",
    //   image: "👨‍🔧"
    // },
    // {
    //   name: "Sunita Reddy",
    //   role: "Head of Customer Success",
    //   description: "Customer experience specialist dedicated to rider satisfaction",
    //   image: "👩‍💼"
    // }
  ];

  const achievements = [
    "Best Electric Mobility Startup 2023",
    "Green Transportation Award 2024",
    "Customer Choice Award 2024",
    "Innovation in Mobility Recognition",
    "Sustainability Leadership Award",
    "Digital India Initiative Partner",
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gradient-main text-foreground morphing-bg ev-particles">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

        <div className="container mx-auto px-4 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              About SDM E-Mobility
            </h1>
            <p className="text-xl text-muted-foreground text-center max-w-6xl mx-auto">
              SDM E-Mobility Services Private Limited is a Mysuru-based company
              dedicated to transforming urban and corporate transportation
              through sustainable, technology-driven cab services. Founded with
              a vision to make mobility cleaner, smarter, and more reliable, we
              operate an all-electric cab fleet that caters to both the general
              public and businesses. <br />
              <br />
              Our mission is to deliver affordable, comfortable, and
              eco-friendly rides while reducing the city's carbon footprint. By
              integrating electric vehicles into our operations, we not only
              lower emissions but also reduce operational costs—savings that are
              passed on to our customers. For corporates, we provide tailored
              mobility solutions that ensure employee safety, punctuality, and
              convenience. <br />
              <br />
              At SDM E-Mobility, we believe mobility is more than just
              transport. It is an experience built on sustainability,
              reliability, and innovation. We are committed to redefining urban
              commuting in Mysuru and setting a benchmark for green mobility in
              tier-2 cities across India.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {stats.map((stat, index) => (
              <Card key={stat.label} className="glass glass-hover p-6 text-center charging-animation" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="p-3 rounded-full bg-gradient-primary w-12 h-12 mx-auto mb-4 electric-glow">
                  <stat.icon className="w-6 h-6 text-white mx-auto" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="glass glass-hover p-8 card-hover-lift">
              <div className="p-4 rounded-full bg-gradient-primary w-16 h-16 mb-6 electric-glow">
                <Target className="w-8 h-8 text-white mx-auto" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground text-lg">
                To provide accessible, reliable, and sustainable electric
                transportation solutions that reduce urban pollution, enhance
                mobility experience, and contribute to a cleaner environment for
                future generations.
              </p>
            </Card>

            <Card className="glass glass-hover p-8 card-hover-lift">
              <div className="p-4 rounded-full bg-gradient-primary w-16 h-16 mb-6 electric-glow">
                <Zap className="w-8 h-8 text-white mx-auto" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground text-lg">
                To become India's leading electric mobility platform,
                transforming urban transportation through innovative technology,
                exceptional service, and unwavering commitment to environmental
                sustainability.
              </p>
            </Card>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value) => (
                <Card key={value.title} className="glass p-6">
                  <value.icon className="w-10 h-10 mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              What Makes Us Stand Out
            </h2>
            <div className="space-y-8">
              {timeline.map((milestone, index) => (
                <Card
                  key={index}
                  className={`glass p-6 ${
                    index % 2 === 1 ? "md:ml-8" : "md:mr-8"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {milestone?.icon}
                    </Badge>
                    <h3 className="text-2xl font-bold">{milestone.title}</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {milestone.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Leadership Team
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 full lg:w-[80%] mx-auto  gap-6 lg:gap-16">
              {team.map((member) => (
                <Card key={member.name} className="glass p-6 text-center">
                  <div className="text-6xl mb-4">
                    {" "}
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover   mx-auto mb-4"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <Badge variant="secondary" className="mb-3">
                    {member.role}
                  </Badge>
                  <p className="text-muted-foreground text-sm">
                    {member.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Achievements
          <Card className="glass p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Awards & Recognition</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gradient-surface rounded-lg">
                  <Award className="w-6 h-6 text-primary flex-shrink-0" />
                  <span className="font-medium">{achievement}</span>
                </div>
              ))}
            </div>
          </Card> */}

          {/* Environmental Impact */}
          <Card className="glass p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">
              Environmental Impact
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <Leaf className="w-16 h-16 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-primary mb-2">10+</div>
                <p className="text-muted-foreground">
                  Tons of CO₂ Emissions Saved
                </p>
              </div>
              <div>
                <Globe className="w-16 h-16 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <p className="text-muted-foreground">Trees Equivalent Impact</p>
              </div>
              <div>
                <Zap className="w-16 h-16 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-primary mb-2">5K+</div>
                <p className="text-muted-foreground">
                  Zero-Emission Kilometers
                </p>
              </div>
            </div>
          </Card>

          {/* Join Us CTA */}
          <Card className="glass p-8 text-center">
            <Users className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h3 className="text-3xl font-bold mb-4">
              Join the Electric Revolution
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be part of the sustainable transportation movement. Whether you're
              a rider looking for eco-friendly travel or interested in
              partnership opportunities, we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-primary h-14 px-8 btn-electric energy-flow">
                <Car className="w-5 h-5 mr-2" />
                Start Your Journey
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 btn-electric hover:bg-primary/5">
                <Users className="w-5 h-5 mr-2" />
                Partner With Us
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
