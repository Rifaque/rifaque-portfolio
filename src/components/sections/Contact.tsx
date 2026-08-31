import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FiSend, FiMail, FiMapPin } from "react-icons/fi";
import GlassCard from "@/components/GlassCard";
import GlassText from "@/components/GlassText";
import { personalInfo } from "@/data/portfolio";

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = encodeURIComponent(`Portfolio Contact from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );

    window.location.href = `mailto:${personalInfo.email}?subject=${subject}&body=${body}`;

    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="py-16 sm:py-24 px-4 sm:px-6" ref={ref}>
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-12"
        >
          <GlassText as="h2" shimmer className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Let's Connect
          </GlassText>
          <p className="text-foreground/60 mt-3 sm:mt-4 max-w-md mx-auto text-sm sm:text-base px-2">
            Have a project in mind? I'd love to hear about it. Let's create something amazing together.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <GlassCard className="p-4 sm:p-6" hover={false}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-aurora-teal/20 to-aurora-purple/20">
                  <FiMail className="w-5 h-5 text-aurora-teal" />
                </div>
                <div>
                  <p className="text-foreground/50 text-sm">Email</p>
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="text-foreground hover:text-aurora-teal transition-colors"
                  >
                    {personalInfo.email}
                  </a>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6" hover={false}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-aurora-teal/20 to-aurora-purple/20">
                  <FiMapPin className="w-5 h-5 text-aurora-teal" />
                </div>
                <div>
                  <p className="text-foreground/50 text-sm">Location</p>
                  <p className="text-foreground">{personalInfo.location}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard className="p-4 sm:p-6" hover={false}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-foreground/70 text-sm mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="glass-input rounded-lg text-foreground"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-foreground/70 text-sm mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass-input rounded-lg text-foreground"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-foreground/70 text-sm mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="glass-input rounded-lg text-foreground min-h-[120px] resize-none"
                    placeholder="Tell me about your project..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="glass-button w-full rounded-lg flex items-center justify-center gap-2 text-foreground aurora-glow"
                >
                  Send Message
                  <FiSend className="w-4 h-4" />
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
