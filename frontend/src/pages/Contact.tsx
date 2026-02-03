import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, Send, Check, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const { name, email, subject, message } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const sendEmailMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await api.post('/contact', data);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again later.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendEmailMutation.mutate(formData);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'sobanilproducts@gmail.com',
      link: 'mailto:sobanilproducts@gmail.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+94 71 780 1214',
      link: 'tel:+94717801214'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: '69H/1, Palagama Road, Ambalangoda, Polgasowita. 10320, Sri Lanka',
      link: 'https://maps.app.goo.gl/NByYEt4D3kzqaRWw8'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      details: '+94 76 402 0374',
      link: 'https://wa.me/+94764020374'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Get in Touch</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Have a question or feedback? We'd love to hear from you.
            Reach out and we'll get back to you within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            {contactInfo.map((info, index) => (
              <Card
                key={info.title}
                className="border-0 shadow-md hover:shadow-lg transition-shadow animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <a
                    href={info.link}
                    className="flex items-start gap-4 group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                      <info.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{info.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{info.details}</p>
                    </div>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardContent className="p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-muted-foreground">
                    Thank you for reaching out. We'll be in touch soon.
                  </p>
                  <Button
                    className="mt-6"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        required
                        className="mt-1"
                        value={name}
                        onChange={onChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        className="mt-1"
                        value={email}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      required
                      className="mt-1"
                      value={subject}
                      onChange={onChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      required
                      className="mt-1 resize-none"
                      value={message}
                      onChange={onChange}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={sendEmailMutation.isPending}>
                    {sendEmailMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" /> Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Contact;
