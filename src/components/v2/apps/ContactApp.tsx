import { useState } from "react";
import { FiSend, FiMail, FiMapPin } from "react-icons/fi";
import { personalInfo } from "@/data/portfolio";

const ContactApp = () => {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = encodeURIComponent(`Portfolio Contact from ${formData.name}`);
        const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
        window.location.href = `mailto:${personalInfo.email}?subject=${subject}&body=${body}`;
        setFormData({ name: "", email: "", message: "" });
    };

    return (
        <div className="p-5 space-y-4">
            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05]">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-md bg-aurora-teal/10">
                            <FiMail className="w-4 h-4 text-aurora-teal" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-foreground/40 text-[10px]">Email</p>
                            <p className="text-foreground text-xs truncate">{personalInfo.email}</p>
                        </div>
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05]">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-md bg-aurora-purple/10">
                            <FiMapPin className="w-4 h-4 text-aurora-purple" />
                        </div>
                        <div>
                            <p className="text-foreground/40 text-[10px]">Location</p>
                            <p className="text-foreground text-xs">{personalInfo.location}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-foreground/50 text-xs mb-1">Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-foreground focus:border-aurora-teal/40 focus:outline-none transition-colors placeholder:text-foreground/30"
                        placeholder="Your name"
                        required
                    />
                </div>
                <div>
                    <label className="block text-foreground/50 text-xs mb-1">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-foreground focus:border-aurora-teal/40 focus:outline-none transition-colors placeholder:text-foreground/30"
                        placeholder="your@email.com"
                        required
                    />
                </div>
                <div>
                    <label className="block text-foreground/50 text-xs mb-1">Message</label>
                    <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-foreground focus:border-aurora-teal/40 focus:outline-none transition-colors resize-none min-h-[80px] placeholder:text-foreground/30"
                        placeholder="Tell me about your project..."
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-foreground hover:border-aurora-teal/30 hover:shadow-[0_0_20px_hsl(168_84%_49%/0.15)] transition-all"
                >
                    <FiSend className="w-4 h-4" /> Send Message
                </button>
            </form>
        </div>
    );
};

export default ContactApp;
