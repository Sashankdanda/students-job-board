import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Coffee, 
  Laptop, 
  BookOpen, 
  Users, 
  ShoppingBag, 
  Camera,
  Heart,
  Code
} from "lucide-react";

const categories = [
  {
    id: 1,
    title: "Part-Time Jobs",
    description: "Flexible hours that work with your class schedule",
    icon: Coffee,
    jobCount: "850+ jobs",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: 2,
    title: "Internships",
    description: "Gain real-world experience in your field of study",
    icon: Laptop,
    jobCount: "420+ positions",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: 3,
    title: "Remote Work",
    description: "Work from anywhere with online opportunities",
    icon: BookOpen,
    jobCount: "680+ remote jobs",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: 4,
    title: "Campus Jobs",
    description: "On-campus positions close to your classes",
    icon: Users,
    jobCount: "220+ on-campus",
    color: "from-orange-500 to-red-500"
  },
  {
    id: 5,
    title: "Retail & Service",
    description: "Customer service and retail opportunities",
    icon: ShoppingBag,
    jobCount: "390+ positions",
    color: "from-indigo-500 to-purple-500"
  },
  {
    id: 6,
    title: "Creative & Media",
    description: "Photography, design, and content creation",
    icon: Camera,
    jobCount: "180+ creative jobs",
    color: "from-pink-500 to-rose-500"
  }
];

const JobCategories = () => {
  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Job Categories
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From flexible part-time work to career-building internships, find opportunities that match your goals
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card key={category.id} className="group hover:shadow-medium transition-all duration-300 cursor-pointer border-0 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                        {category.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {category.jobCount}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default JobCategories;