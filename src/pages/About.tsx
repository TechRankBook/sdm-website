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
  Star
} from "lucide-react";

const About = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const stats = [
    { label: "Cities Served", value: "25+", icon: MapPin },
    { label: "Happy Customers", value: "2.5M+", icon: Users },
    { label: "Electric Vehicles", value: "500+", icon: Car },
    { label: "Zero Emissions", value: "100%", icon: Leaf },
    { label: "Customer Rating", value: "4.8★", icon: Star },
    { label: "CO₂ Saved", value: "10K+ tons", icon: Globe }
  ];

  const values = [
    {
      icon: Leaf,
      title: "Sustainability",
      description: "Committed to zero-emission transportation and environmental protection through 100% electric fleet."
    },
    {
      icon: Shield,
      title: "Safety First", 
      description: "Prioritizing passenger safety with verified drivers, real-time tracking, and 24/7 support."
    },
    {
      icon: Users,
      title: "Customer-Centric",
      description: "Putting customers at the heart of everything we do with transparent pricing and quality service."
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "Leading the future of mobility with cutting-edge technology and smart transportation solutions."
    },
    {
      icon: Heart,
      title: "Community Impact",
      description: "Contributing to cleaner cities and better quality of life for urban communities."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Maintaining highest standards in service quality, vehicle maintenance, and customer experience."
    }
  ];

  const timeline = [
    {
      year: "2020",
      title: "Company Founded",
      description: "SDM E-Mobility was established with a vision to revolutionize urban transportation through sustainable electric mobility."
    },
    {
      year: "2021",
      title: "First Fleet Launch",
      description: "Launched our first fleet of 50 electric vehicles in Bangalore, beginning our journey towards zero-emission transport."
    },
    {
      year: "2022",
      title: "Multi-City Expansion",
      description: "Expanded operations to 10 major Indian cities, establishing ourselves as a leading electric mobility platform."
    },
    {
      year: "2023",
      title: "Technology Innovation",
      description: "Introduced advanced AI-powered route optimization and real-time tracking features for enhanced user experience."
    },
    {
      year: "2024",
      title: "Sustainable Milestone",
      description: "Achieved 1 million zero-emission rides and saved over 5,000 tons of CO₂ emissions."
    },
    {
      year: "2025",
      title: "Future Vision",
      description: "Expanding to 50+ cities with 2,000 electric vehicles, leading India's sustainable transportation revolution."
    }
  ];

  const team = [
    {
      name: "Rajesh Kumar",
      role: "CEO & Founder",
      description: "15+ years in automotive industry, passionate about sustainable transportation",
      image: "👨‍💼"
    },
    {
      name: "Priya Sharma",
      role: "CTO",
      description: "Tech innovator with expertise in AI, IoT, and mobile app development",
      image: "👩‍💻"
    },
    {
      name: "Amit Patel",
      role: "Head of Operations",
      description: "Operations expert ensuring seamless service delivery across all cities",
      image: "👨‍🔧"
    },
    {
      name: "Sunita Reddy", 
      role: "Head of Customer Success",
      description: "Customer experience specialist dedicated to rider satisfaction",
      image: "👩‍💼"
    }
  ];

  const achievements = [
    "Best Electric Mobility Startup 2023",
    "Green Transportation Award 2024", 
    "Customer Choice Award 2024",
    "Innovation in Mobility Recognition",
    "Sustainability Leadership Award",
    "Digital India Initiative Partner"
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-main text-foreground">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        
        <div className="container mx-auto px-4 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              About SDM E-Mobility
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Pioneering the future of sustainable urban transportation with 100% electric mobility solutions. 
              We're not just moving people, we're moving towards a cleaner, greener tomorrow.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {stats.map((stat) => (
              <Card key={stat.label} className="glass p-6 text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="glass p-8">
              <Target className="w-12 h-12 mb-6 text-primary" />
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground text-lg">
                To provide accessible, reliable, and sustainable electric transportation solutions that 
                reduce urban pollution, enhance mobility experience, and contribute to a cleaner environment 
                for future generations.
              </p>
            </Card>
            
            <Card className="glass p-8">
              <Zap className="w-12 h-12 mb-6 text-primary" />
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground text-lg">
                To become India's leading electric mobility platform, transforming urban transportation 
                through innovative technology, exceptional service, and unwavering commitment to 
                environmental sustainability.
              </p>
            </Card>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
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
            <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
            <div className="space-y-8">
              {timeline.map((milestone, index) => (
                <Card key={milestone.year} className={`glass p-6 ${index % 2 === 1 ? 'md:ml-8' : 'md:mr-8'}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {milestone.year}
                    </Badge>
                    <h3 className="text-2xl font-bold">{milestone.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Leadership Team</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <Card key={member.name} className="glass p-6 text-center">
                  <div className="text-6xl mb-4">{member.image}</div>
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <Badge variant="secondary" className="mb-3">{member.role}</Badge>
                  <p className="text-muted-foreground text-sm">{member.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Achievements */}
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
          </Card>

          {/* Environmental Impact */}
          <Card className="glass p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Environmental Impact</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <Leaf className="w-16 h-16 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                <p className="text-muted-foreground">Tons of CO₂ Emissions Saved</p>
              </div>
              <div>
                <Globe className="w-16 h-16 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-primary mb-2">50,000+</div>
                <p className="text-muted-foreground">Trees Equivalent Impact</p>
              </div>
              <div>
                <Zap className="w-16 h-16 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-primary mb-2">5M+</div>
                <p className="text-muted-foreground">Zero-Emission Kilometers</p>
              </div>
            </div>
          </Card>

          {/* Join Us CTA */}
          <Card className="glass p-8 text-center">
            <Users className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h3 className="text-3xl font-bold mb-4">Join the Electric Revolution</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be part of the sustainable transportation movement. Whether you're a rider looking for 
              eco-friendly travel or interested in partnership opportunities, we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-primary h-14 px-8">
                <Car className="w-5 h-5 mr-2" />
                Start Your Journey
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8">
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