import { Link } from 'react-router-dom';
import { Search, FileQuestion, FileCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const HomePage = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Campus Lost & Found
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Lost something on campus? Found an item that belongs to someone else? 
          We're here to help reunite items with their owners.
        </p>
      </section>

      {/* Action Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <FileQuestion className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Report Lost Item</CardTitle>
            <CardDescription>
              Lost something? Report it so we can notify you if it's found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/report-lost">
              <Button className="w-full gap-2">
                Report Lost
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <FileCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Report Found Item</CardTitle>
            <CardDescription>
              Found something? Let us know so we can return it to its owner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/report-found">
              <Button variant="secondary" className="w-full gap-2">
                Report Found
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-2">
              <Search className="h-6 w-6 text-accent-foreground" />
            </div>
            <CardTitle>Search Items</CardTitle>
            <CardDescription>
              Browse items currently held at the Lost & Found office.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/search">
              <Button variant="outline" className="w-full gap-2">
                Search
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <section className="text-center py-8 border-t">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto text-sm text-muted-foreground">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto font-bold">1</div>
            <p>Report your lost or found item with details</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto font-bold">2</div>
            <p>Security team reviews and processes reports</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto font-bold">3</div>
            <p>Get notified when your item is found</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
