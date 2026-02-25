"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { updateUser } from "@/lib/firebase/firestore";
import { uploadProfilePhotos } from "@/lib/firebase/storage";
import { changePassword } from "@/lib/firebase/auth";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Combobox } from "@/components/ui/Combobox";
import {
  SLEEP_SCHEDULE_OPTIONS,
  WORK_FROM_HOME_OPTIONS,
  LEASE_LENGTH_OPTIONS,
  CLEANLINESS_LABELS,
  BEDS_OPTIONS,
  BATHS_OPTIONS,
  NEIGHBORHOODS_BY_CITY,
} from "@/lib/utils/constants";
import universities from "@/data/universities_us.json";
import cities from "@/data/us_major_cities.json";

export default function ProfileEditPage() {
  const router = useRouter();
  const { uid } = useAuthStore();
  const { user, loading } = useCurrentUser();

  // Photos
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [mainPhotoIdx, setMainPhotoIdx] = useState(0);

  // Personal
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");

  // About You
  const [occupation, setOccupation] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [company, setCompany] = useState("");
  const [hometown, setHometown] = useState("");
  const [university, setUniversity] = useState("");

  // Bio
  const [bio, setBio] = useState("");

  // Lifestyle
  const [hasPet, setHasPet] = useState(false);
  const [smokes, setSmokes] = useState(false);
  const [host, setHost] = useState(false);
  const [workFromHome, setWorkFromHome] = useState("No, I go in");
  const [cleanliness, setCleanliness] = useState(3);
  const [sleepSchedule, setSleepSchedule] = useState("Flexible");

  // Home Requirements
  const [budgetMin, setBudgetMin] = useState(800);
  const [budgetMax, setBudgetMax] = useState(1500);
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [furnished, setFurnished] = useState(false);
  const [leaseLength, setLeaseLength] = useState("");
  const [hasAC, setHasAC] = useState(false);
  const [hasLaundry, setHasLaundry] = useState(false);
  const [hasParking, setHasParking] = useState(false);
  const [moveCity, setMoveCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setUsername(user.username ?? "");
    setPhone(user.phone ?? "");
    setAge(user.age ?? "");
    setOccupation(user.occupation ?? "");
    setCompanyIndustry(user.companyIndustry ?? "");
    setCompany(user.company ?? "");
    setHometown(user.hometown ?? "");
    setUniversity(user.university ?? "");
    setBio(user.bio ?? "");
    setHasPet(user.hasPet ?? false);
    setSmokes(user.smokes ?? false);
    setHost(user.host ?? false);
    setWorkFromHome(user.workFromHome ?? "No, I go in");
    setCleanliness(user.cleanliness ?? 3);
    setSleepSchedule(user.sleepSchedule ?? "Flexible");
    setBudgetMin(user.budgetMin ?? 800);
    setBudgetMax(user.budgetMax ?? 1500);
    setBeds(user.beds ?? "");
    setBaths(user.baths ?? "");
    setFurnished(user.furnished ?? false);
    setLeaseLength(user.leaseLength ?? "");
    setHasAC(user.hasAC ?? false);
    setHasLaundry(user.hasLaundry ?? false);
    setHasParking(user.hasParking ?? false);
    setMoveCity(user.moveCity ?? "");
    setNeighborhood(user.neighborhood ?? "");
    const existingNeighborhoods = user.neighborhoodPreferences ?? (user.neighborhood ? [user.neighborhood] : []);
    setNeighborhoods(existingNeighborhoods);
    const photos = user.photoURLs ?? [];
    setExistingPhotos(photos);
    setMainPhotoIdx(0);
  }, [user]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5);
    setPhotoFiles(files);
    setPhotoPreviews(files.map((f) => URL.createObjectURL(f)));
    setMainPhotoIdx(0);
  }

  const displayPhotos = photoPreviews.length ? photoPreviews : existingPhotos;
  const canReorderExisting = !photoFiles.length && displayPhotos.length > 0;
  const canReorderNew = photoFiles.length > 0;

  function movePhoto(from: number, to: number) {
    if (to < 0 || to >= displayPhotos.length) return;
    if (canReorderNew) {
      const nextFiles = [...photoFiles];
      const [moved] = nextFiles.splice(from, 1);
      nextFiles.splice(to, 0, moved);
      setPhotoFiles(nextFiles);
      setPhotoPreviews(nextFiles.map((f) => URL.createObjectURL(f)));
    } else {
      const nextExisting = [...existingPhotos];
      const [moved] = nextExisting.splice(from, 1);
      nextExisting.splice(to, 0, moved);
      setExistingPhotos(nextExisting);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    setSaving(true);
    try {
      if (displayPhotos.length < 5) {
        toast.error("Please upload 5 photos");
        return;
      }
      let photoURLs = existingPhotos;
      if (photoFiles.length) {
        photoURLs = await uploadProfilePhotos(uid, photoFiles);
      }
      const mainUrl = photoURLs[mainPhotoIdx] ?? photoURLs[0] ?? "";
      const reordered = mainUrl ? [mainUrl, ...photoURLs.filter((_, i) => i !== mainPhotoIdx)] : photoURLs;
      await updateUser(uid, {
        name, username, phone, age,
        occupation, companyIndustry, company, hometown, university,
        bio,
        hasPet, smokes, host, workFromHome, cleanliness, sleepSchedule,
        budgetMin, budgetMax, beds, baths, furnished, leaseLength,
        hasAC, hasLaundry, hasParking, moveCity,
        neighborhood: neighborhoods[0] ?? neighborhood,
        neighborhoodPreferences: neighborhoods,
        photoURLs: reordered,
        profileImageURL: reordered[0] ?? user?.profileImageURL ?? "",
      });
      toast.success("Profile saved!");
      router.push("/profile");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!newPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(newPassword);
      toast.success("Password updated!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) return <div className="flex justify-center pt-20"><LoadingSpinner /></div>;

  const neighborhoodOptions = NEIGHBORHOODS_BY_CITY[moveCity] ?? [];

  return (
    <div className="max-w-xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-black font-heading">Edit Profile</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8">

        {/* ─── Photos ─────────────────────────────────────── */}
        <Section title="Photos">
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Upload 5 photos · Tap a photo to set your profile picture</p>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-roome-core/20 flex items-center justify-center">
              {displayPhotos[mainPhotoIdx]
                ? <img src={displayPhotos[mainPhotoIdx]} alt="" className="w-full h-full object-cover" />
                : <span className="text-4xl text-roome-deep/30">+</span>
              }
              <span className="absolute top-2 left-2 bg-roome-core text-white text-[10px] font-bold px-2 py-0.5 rounded-full">MAIN PHOTO</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => {
                const idx = i + 1;
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setMainPhotoIdx(idx)}
                    className={`aspect-square rounded-xl overflow-hidden bg-roome-core/20 flex items-center justify-center ${mainPhotoIdx === idx ? "ring-2 ring-roome-core" : ""}`}
                  >
                    {displayPhotos[idx]
                      ? <img src={displayPhotos[idx]} alt="" className="w-full h-full object-cover" />
                      : <span className="text-roome-deep/30 text-2xl">+</span>
                    }
                  </button>
                );
              })}
            </div>
            {displayPhotos.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {displayPhotos.map((src, i) => (
                  <div key={i} className="rounded-xl bg-roome-core/20 p-2 text-center">
                    <img src={src} alt="" className="w-full h-16 object-cover rounded-lg mb-2" />
                    <div className="flex gap-1 justify-center">
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded-lg bg-white shadow-sm text-roome-black"
                        onClick={() => movePhoto(i, i - 1)}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded-lg bg-white shadow-sm text-roome-black"
                        onClick={() => movePhoto(i, i + 1)}
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <label className="block text-center">
              <span className="inline-block bg-roome-core/20 text-roome-black font-semibold px-6 py-3 rounded-2xl cursor-pointer hover:opacity-80 transition text-sm">
                {photoFiles.length ? `${photoFiles.length} photo${photoFiles.length > 1 ? "s" : ""} selected` : "Choose Photos (up to 5)"}
              </span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
        </Section>

        {/* ─── Personal Info ──────────────────────────────── */}
        <Section title="Personal Info">
          <Field label="Full Name" placeholder="Your full name" value={name} onChange={setName} labelClassName="text-roome-black" />
          <ReadonlyField label="Email" value={user?.email ?? ""} labelClassName="text-roome-black" />
          <Field label="Username" placeholder="@yourhandle" value={username} labelClassName="text-roome-black"
            onChange={(v) => setUsername(v.toLowerCase().replace(/\s/g, ""))} />
          <Field label="Phone Number" placeholder="+1 (555) 000-0000" value={phone} onChange={setPhone} type="tel" labelClassName="text-roome-black" />
          <Field label="Age" placeholder="e.g. 24" value={age} onChange={setAge} type="number" labelClassName="text-roome-black" />
        </Section>

        {/* ─── About You ──────────────────────────────────── */}
        <Section title="About You">
          <SelectField
            label="Industry"
            value={companyIndustry}
            onChange={(v) => { setCompanyIndustry(v); setCompany(""); setOccupation(""); }}
            options={INDUSTRY_OPTIONS}
            labelClassName="text-roome-black"
          />
          <SelectField
            label="Company"
            value={company}
            onChange={setCompany}
            options={COMPANIES_BY_INDUSTRY[companyIndustry] ?? []}
            disabled={!companyIndustry}
            placeholder={companyIndustry ? "Select…" : "Select an industry first"}
            labelClassName="text-roome-black"
          />
          <SelectField
            label="Job Title"
            value={occupation}
            onChange={setOccupation}
            options={JOB_TITLES_BY_INDUSTRY[companyIndustry] ?? JOB_TITLE_OPTIONS}
            disabled={!companyIndustry}
            placeholder={companyIndustry ? "Select…" : "Select an industry first"}
            labelClassName="text-roome-black"
          />
          <Field label="Hometown" placeholder="e.g. Austin, TX" value={hometown} onChange={setHometown} labelClassName="text-roome-black" />
          <Combobox
            label="College / University"
            placeholder="Search your school…"
            value={university}
            onChange={setUniversity}
            options={universities}
            inputClassName="bg-roome-core/20 text-roome-black placeholder-roome-black/60 focus:bg-white"
          />
        </Section>

        {/* ─── Bio ────────────────────────────────────────── */}
        <Section title="Bio">
          <div className="space-y-1">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 300))}
              placeholder="I'm a grad student who loves hiking, cooking, and keeping things tidy…"
              rows={4}
              className="w-full px-4 py-3 rounded-2xl bg-roome-core/20 text-roome-black placeholder-roome-black/60 border border-transparent resize-none focus:outline-none focus:ring-2 focus:ring-roome-core/40 focus:bg-white transition"
            />
            <p className="text-xs text-gray-400 text-right">{bio.length}/300</p>
          </div>
        </Section>

        {/* ─── Lifestyle ──────────────────────────────────── */}
        <Section title="Lifestyle">
          <Card>
            <Toggle label="Do you have a pet?" value={hasPet} onChange={setHasPet} />
          </Card>
          <Card>
            <Toggle label="Do you smoke?" value={smokes} onChange={setSmokes} />
          </Card>
          <Card>
            <Toggle label="Do you like to host?" value={host} onChange={setHost} />
          </Card>
          <Card>
            <p className="font-semibold mb-2 text-sm">Work from home?</p>
            <OptionPicker selected={workFromHome} options={[...WORK_FROM_HOME_OPTIONS]} onSelect={setWorkFromHome} />
          </Card>
          <Card>
            <p className="font-semibold mb-2 text-sm">Sleep Schedule</p>
            <OptionPicker selected={sleepSchedule} options={[...SLEEP_SCHEDULE_OPTIONS]} onSelect={setSleepSchedule} />
          </Card>
          <Card>
            <p className="font-semibold mb-2 text-sm">Cleanliness</p>
            <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Relaxed</span><span>Super tidy</span></div>
            <input type="range" min={1} max={5} step={1} value={cleanliness}
              onChange={(e) => setCleanliness(Number(e.target.value))}
              className="w-full rounded-full"
              style={{ background: sliderFill(cleanliness, 1, 5) }}
            />
            <p className="text-xs text-roome-core font-medium mt-1">{CLEANLINESS_LABELS[cleanliness]}</p>
          </Card>
        </Section>

        {/* ─── Home Requirements ──────────────────────────── */}
        <Section title="Home Requirements">
          <Card>
            <p className="font-semibold mb-1 text-sm">Rent Range</p>
            <p className="text-2xl font-black text-roome-core text-center my-2">
              ${budgetMin.toLocaleString()} – ${budgetMax.toLocaleString()}<span className="text-base font-normal text-gray-400">/mo</span>
            </p>
            <label className="text-xs text-gray-500">Min: ${budgetMin}</label>
            <input type="range" min={500} max={5000} step={50} value={budgetMin}
              onChange={(e) => setBudgetMin(Number(e.target.value))}
              className="w-full rounded-full mt-1"
              style={{ background: sliderFill(budgetMin, 500, 5000) }}
            />
            <label className="text-xs text-gray-500 block mt-2">Max: ${budgetMax}</label>
            <input type="range" min={500} max={5000} step={50} value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              className="w-full rounded-full mt-1"
              style={{ background: sliderFill(budgetMax, 500, 5000) }}
            />
          </Card>

          <Card>
            <p className="font-semibold mb-2 text-sm">Bedrooms</p>
            <OptionPicker selected={beds} options={[...BEDS_OPTIONS]} onSelect={setBeds} />
          </Card>

          <Card>
            <p className="font-semibold mb-2 text-sm">Bathrooms</p>
            <OptionPicker selected={baths} options={[...BATHS_OPTIONS]} onSelect={setBaths} />
          </Card>

          <Card>
            <p className="font-semibold mb-2 text-sm">Lease Length</p>
            <OptionPicker selected={leaseLength} options={[...LEASE_LENGTH_OPTIONS]} onSelect={setLeaseLength} />
          </Card>

          <Card>
            <Toggle label="Need it furnished?" value={furnished} onChange={setFurnished} />
          </Card>

          <Card>
            <p className="font-semibold mb-3 text-sm">Amenities Needed</p>
            <div className="space-y-3">
              <Toggle label="AC / Air Conditioning" value={hasAC} onChange={setHasAC} />
              <Toggle label="In-unit Laundry" value={hasLaundry} onChange={setHasLaundry} />
              <Toggle label="Parking" value={hasParking} onChange={setHasParking} />
            </div>
          </Card>

          <Combobox
            label="Target City"
            placeholder="Where are you moving?"
            value={moveCity}
            onChange={(v) => { setMoveCity(v); setNeighborhood(""); }}
            options={cities}
            inputClassName="bg-roome-core/20 text-roome-black placeholder-roome-black/60 focus:bg-white"
            labelClassName="text-roome-black"
          />

          {neighborhoodOptions.length > 0 ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Preferred Neighborhoods</label>
              <MultiSelect
                options={neighborhoodOptions}
                selected={neighborhoods}
                onToggle={(n) => toggleNeighborhood(n, neighborhoods, setNeighborhoods)}
              />
            </div>
          ) : moveCity ? (
            <NeighborhoodInput
              value={neighborhood}
              onChange={setNeighborhood}
              selected={neighborhoods}
              onRemove={(n) => setNeighborhoods((prev) => prev.filter((x) => x !== n))}
              onAdd={(n) => {
                if (!n) return;
                if (neighborhoods.includes(n)) return;
                setNeighborhoods((prev) => [...prev, n]);
                setNeighborhood("");
              }}
            />
          ) : null}
        </Section>

        <Button type="submit" loading={saving} className="w-full" size="lg">Save Changes</Button>
      </form>

      {/* ─── Change Password ────────────────────────────── */}
      <div className="mt-10 space-y-4">
        <h2 className="text-lg font-bold font-heading">Change Password</h2>
        <Field label="New Password" placeholder="At least 6 characters" value={newPassword}
          labelClassName="text-roome-black"
          onChange={setNewPassword} type="password" />
        <Field label="Confirm Password" placeholder="Repeat new password" value={confirmPassword}
          labelClassName="text-roome-black"
          onChange={setConfirmPassword} type="password" />
        <Button
          type="button"
          onClick={handleChangePassword}
          loading={changingPassword}
          className="w-full"
          disabled={!newPassword || !confirmPassword}
        >
          Update Password
        </Button>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold font-heading">{title}</h2>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl p-4 shadow-sm">{children}</div>;
}

function Field({ label, placeholder, value, onChange, type = "text", labelClassName }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string;
  labelClassName?: string;
}) {
  return (
    <div className="space-y-1">
      <label className={`text-sm font-medium ${labelClassName ?? "text-roome-core"}`}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl bg-roome-core/20 text-roome-black placeholder-roome-black/60 border border-transparent focus:outline-none focus:ring-2 focus:ring-roome-core/40 focus:bg-white transition"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
  placeholder,
  labelClassName,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
  placeholder?: string;
  labelClassName?: string;
}) {
  return (
    <div className="space-y-1">
      <label className={`text-sm font-medium ${labelClassName ?? "text-roome-core"}`}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-2xl bg-roome-core/20 text-roome-black border border-transparent focus:outline-none focus:ring-2 focus:ring-roome-core/40 focus:bg-white transition disabled:opacity-60"
      >
        <option value="">{placeholder ?? "Select…"}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function ReadonlyField({ label, value, labelClassName }: { label: string; value: string; labelClassName?: string }) {
  return (
    <div className="space-y-1">
      <label className={`text-sm font-medium ${labelClassName ?? "text-roome-core"}`}>{label}</label>
      <div className="w-full px-4 py-3 rounded-2xl bg-roome-core/20 text-roome-black text-sm">{value}</div>
    </div>
  );
}

const JOB_TITLE_OPTIONS = [
  "Software Engineer",
  "Product Manager",
  "Product Designer",
  "UX/UI Designer",
  "Data Analyst",
  "Data Scientist",
  "Business Analyst",
  "Consultant",
  "Investment Banking Analyst",
  "Financial Analyst",
  "Marketing Associate",
  "Growth Marketing",
  "Sales Associate",
  "Account Executive",
  "Operations Associate",
  "Project Manager",
  "Program Manager",
  "Research Analyst",
  "Healthcare Analyst",
  "Supply Chain Analyst",
  "Mechanical Engineer",
  "Electrical Engineer",
  "Civil Engineer",
  "Other",
];

const JOB_TITLES_BY_INDUSTRY: Record<string, string[]> = {
  "Technology & Data": [
    "Software Engineer",
    "Product Manager",
    "Product Designer",
    "UX/UI Designer",
    "Data Scientist",
    "Data Analyst",
    "ML Engineer",
    "DevOps Engineer",
    "QA Engineer",
    "Solutions Engineer",
    "Customer Success",
    "Technical Support",
    "Other",
  ],
  "Software Development / Engineering": [
    "Software Engineer",
    "Full Stack Engineer",
    "Backend Engineer",
    "Frontend Engineer",
    "Mobile Engineer",
    "Platform Engineer",
    "Other",
  ],
  "Information Technology (IT Support / Systems)": [
    "IT Support Specialist",
    "Systems Administrator",
    "Network Administrator",
    "Help Desk Technician",
    "Other",
  ],
  Cybersecurity: [
    "Security Analyst",
    "Security Engineer",
    "SOC Analyst",
    "GRC Analyst",
    "Other",
  ],
  "Data Analytics": [
    "Data Analyst",
    "Business Analyst",
    "BI Analyst",
    "Other",
  ],
  "Data Science": [
    "Data Scientist",
    "ML Engineer",
    "Research Scientist",
    "Other",
  ],
  "Artificial Intelligence / Machine Learning": [
    "ML Engineer",
    "Applied Scientist",
    "Research Engineer",
    "Other",
  ],
  "Cloud Computing / DevOps": [
    "DevOps Engineer",
    "Cloud Engineer",
    "Site Reliability Engineer",
    "Platform Engineer",
    "Other",
  ],
  "Product Management": [
    "Product Manager",
    "Associate Product Manager",
    "Product Analyst",
    "Other",
  ],
  "UX / UI Design": [
    "UX Designer",
    "UI Designer",
    "Product Designer",
    "UX Researcher",
    "Other",
  ],
  "QA / Testing": [
    "QA Engineer",
    "Test Engineer",
    "Automation Engineer",
    "Other",
  ],
  "Web Development": [
    "Frontend Engineer",
    "Full Stack Engineer",
    "Web Developer",
    "Other",
  ],
  "Mobile App Development": [
    "iOS Engineer",
    "Android Engineer",
    "Mobile Engineer",
    "Other",
  ],
  "Healthcare & Life Sciences": [
    "Clinical Research Coordinator",
    "Healthcare Analyst",
    "Health Data Analyst",
    "Operations Associate",
    "Other",
  ],
  "Hospital Administration": [
    "Hospital Administrator",
    "Operations Manager",
    "Patient Services Coordinator",
    "Other",
  ],
  Nursing: [
    "Registered Nurse",
    "Nurse Practitioner",
    "Clinical Nurse",
    "Other",
  ],
  "Physician Assistant / Clinical Roles": [
    "Physician Assistant",
    "Medical Assistant",
    "Clinical Technician",
    "Other",
  ],
  "Public Health": [
    "Public Health Analyst",
    "Epidemiology Analyst",
    "Program Coordinator",
    "Other",
  ],
  "Health Consulting": [
    "Healthcare Consultant",
    "Analyst",
    "Associate",
    "Other",
  ],
  "Health Informatics / Health IT": [
    "Health Informatics Analyst",
    "Health IT Specialist",
    "Data Analyst",
    "Other",
  ],
  Pharmaceuticals: [
    "Research Associate",
    "Clinical Research Associate",
    "Medical Affairs Associate",
    "Other",
  ],
  Biotechnology: [
    "Research Associate",
    "Lab Technician",
    "Clinical Research Associate",
    "Other",
  ],
  "Medical Devices": [
    "Product Specialist",
    "Quality Engineer",
    "Clinical Specialist",
    "Other",
  ],
  "Clinical Research": [
    "Clinical Research Coordinator",
    "Clinical Research Associate",
    "Data Coordinator",
    "Other",
  ],
  "Healthcare Operations": [
    "Operations Analyst",
    "Practice Manager",
    "Care Coordinator",
    "Other",
  ],
  "Mental Health Services": [
    "Counselor",
    "Behavioral Health Technician",
    "Program Coordinator",
    "Other",
  ],
  "Marketing, Sales & Communications": [
    "Marketing Associate",
    "Growth Marketing",
    "Sales Associate",
    "Account Executive",
    "Communications Associate",
    "Other",
  ],
  "Retail, E-commerce & Operations": [
    "Operations Manager",
    "E-commerce Associate",
    "Merchandising Analyst",
    "Customer Experience",
    "Procurement Analyst",
    "Other",
  ],
  "Retail Management": [
    "Store Manager",
    "Retail Manager",
    "Other",
  ],
  "E-commerce": [
    "E-commerce Associate",
    "E-commerce Manager",
    "Other",
  ],
  "Merchandising / Buying": [
    "Buyer",
    "Merchandising Analyst",
    "Other",
  ],
  "Operations Management": [
    "Operations Manager",
    "Operations Analyst",
    "Other",
  ],
  "Customer Experience": [
    "Customer Experience Associate",
    "Customer Success",
    "Other",
  ],
  "Procurement / Sourcing": [
    "Procurement Analyst",
    "Sourcing Specialist",
    "Other",
  ],
  "Marketing (Digital, Brand, Growth)": [
    "Digital Marketing Specialist",
    "Brand Manager",
    "Growth Marketing",
    "Other",
  ],
  Advertising: [
    "Account Coordinator",
    "Media Planner",
    "Copywriter",
    "Other",
  ],
  "Public Relations": [
    "PR Associate",
    "Communications Associate",
    "Media Relations",
    "Other",
  ],
  "Social Media Management": [
    "Social Media Manager",
    "Content Strategist",
    "Community Manager",
    "Other",
  ],
  "Content Creation": [
    "Content Creator",
    "Content Strategist",
    "Copywriter",
    "Other",
  ],
  "Sales (B2B / B2C / Tech Sales)": [
    "Sales Associate",
    "Account Executive",
    "Sales Development Rep",
    "Other",
  ],
  "Business Development": [
    "Business Development Associate",
    "Partnerships Associate",
    "Other",
  ],
  "Market Research": [
    "Market Research Analyst",
    "Consumer Insights Analyst",
    "Other",
  ],
  "Event Marketing": [
    "Event Coordinator",
    "Event Marketing Associate",
    "Other",
  ],
  "Media, Creative & Entertainment": [
    "Content Producer",
    "Creative Producer",
    "Marketing Associate",
    "Other",
  ],
  "Film & Television Production": [
    "Production Assistant",
    "Producer",
    "Post Production Coordinator",
    "Other",
  ],
  "Music Industry": [
    "Artist Relations",
    "A&R Assistant",
    "Marketing Associate",
    "Other",
  ],
  Publishing: [
    "Editorial Assistant",
    "Publicist",
    "Other",
  ],
  Journalism: [
    "Reporter",
    "Editor",
    "Producer",
    "Other",
  ],
  "Graphic Design": [
    "Graphic Designer",
    "Visual Designer",
    "Other",
  ],
  "Animation / Motion Graphics": [
    "Motion Designer",
    "Animator",
    "Other",
  ],
  "Photography / Videography": [
    "Photographer",
    "Videographer",
    "Other",
  ],
  "Creative Direction": [
    "Creative Director",
    "Art Director",
    "Other",
  ],
  "Fashion Industry": [
    "Merchandising Associate",
    "Designer",
    "Other",
  ],
  "Government, Law & Policy": [
    "Program Analyst",
    "Policy Analyst",
    "Coordinator",
    "Other",
  ],
  "Government & Public Administration": [
    "Program Analyst",
    "Policy Analyst",
    "Coordinator",
    "Other",
  ],
  "Public Policy": [
    "Policy Analyst",
    "Research Analyst",
    "Other",
  ],
  "Law (Paralegal / Legal Assistant)": [
    "Paralegal",
    "Legal Assistant",
    "Other",
  ],
  "Compliance & Regulatory Affairs": [
    "Compliance Analyst",
    "Regulatory Associate",
    "Other",
  ],
  "Intelligence & National Security": [
    "Intelligence Analyst",
    "Research Analyst",
    "Other",
  ],
  "International Relations": [
    "Program Associate",
    "Policy Analyst",
    "Other",
  ],
  "Political Consulting": [
    "Political Analyst",
    "Campaign Associate",
    "Other",
  ],
  "Education & Nonprofit": [
    "Program Coordinator",
    "Admissions Counselor",
    "Academic Advisor",
    "Other",
  ],
  "Teaching / Education Administration": [
    "Teacher",
    "School Administrator",
    "Other",
  ],
  "Higher Education": [
    "Academic Advisor",
    "Program Coordinator",
    "Other",
  ],
  "Nonprofit Management": [
    "Program Manager",
    "Operations Associate",
    "Other",
  ],
  "Philanthropy / Foundations": [
    "Program Associate",
    "Grants Associate",
    "Other",
  ],
  "Social Services": [
    "Case Manager",
    "Program Coordinator",
    "Other",
  ],
  "Community Development": [
    "Community Coordinator",
    "Program Associate",
    "Other",
  ],
  "International Development": [
    "Program Associate",
    "Field Coordinator",
    "Other",
  ],
  "Real Estate, Hospitality & Consumer": [
    "Real Estate Analyst",
    "Hospitality Associate",
    "Operations Coordinator",
    "Other",
  ],
  "Property Management": [
    "Property Manager",
    "Leasing Consultant",
    "Other",
  ],
  "Urban Planning": [
    "Urban Planner",
    "Planning Analyst",
    "Other",
  ],
  "Hospitality & Tourism": [
    "Hospitality Associate",
    "Guest Services",
    "Other",
  ],
  "Hotel Management": [
    "Hotel Manager",
    "Operations Manager",
    "Other",
  ],
  "Food & Beverage / Restaurants": [
    "Restaurant Manager",
    "Operations Associate",
    "Other",
  ],
  "Event Planning": [
    "Event Planner",
    "Event Coordinator",
    "Other",
  ],
  "Travel & Leisure": [
    "Travel Coordinator",
    "Operations Associate",
    "Other",
  ],
  "Engineering & Manufacturing": [
    "Mechanical Engineer",
    "Electrical Engineer",
    "Industrial Engineer",
    "Manufacturing Engineer",
    "Other",
  ],
  "Mechanical Engineering": [
    "Mechanical Engineer",
    "Manufacturing Engineer",
    "Other",
  ],
  "Electrical Engineering": [
    "Electrical Engineer",
    "Controls Engineer",
    "Other",
  ],
  "Civil Engineering": [
    "Civil Engineer",
    "Project Engineer",
    "Other",
  ],
  "Industrial Engineering": [
    "Industrial Engineer",
    "Process Engineer",
    "Other",
  ],
  Manufacturing: [
    "Manufacturing Engineer",
    "Quality Engineer",
    "Other",
  ],
  "Supply Chain & Logistics": [
    "Supply Chain Analyst",
    "Logistics Coordinator",
    "Other",
  ],
  Automotive: [
    "Automotive Engineer",
    "Manufacturing Engineer",
    "Other",
  ],
  Aerospace: [
    "Aerospace Engineer",
    "Systems Engineer",
    "Other",
  ],
  Other: ["Other"],
};

const INDUSTRY_OPTIONS = [
  "Technology & Data",
  "Software Development / Engineering",
  "Information Technology (IT Support / Systems)",
  "Cybersecurity",
  "Data Analytics",
  "Data Science",
  "Artificial Intelligence / Machine Learning",
  "Cloud Computing / DevOps",
  "Product Management",
  "UX / UI Design",
  "QA / Testing",
  "Web Development",
  "Mobile App Development",
  "Healthcare & Life Sciences",
  "Hospital Administration",
  "Nursing",
  "Physician Assistant / Clinical Roles",
  "Public Health",
  "Health Consulting",
  "Health Informatics / Health IT",
  "Pharmaceuticals",
  "Biotechnology",
  "Medical Devices",
  "Clinical Research",
  "Healthcare Operations",
  "Mental Health Services",
  "Marketing, Sales & Communications",
  "Marketing (Digital, Brand, Growth)",
  "Advertising",
  "Public Relations",
  "Social Media Management",
  "Content Creation",
  "Sales (B2B / B2C / Tech Sales)",
  "Business Development",
  "Market Research",
  "Event Marketing",
  "Media, Creative & Entertainment",
  "Film & Television Production",
  "Music Industry",
  "Publishing",
  "Journalism",
  "Graphic Design",
  "Animation / Motion Graphics",
  "Photography / Videography",
  "Creative Direction",
  "Fashion Industry",
  "Government, Law & Policy",
  "Government & Public Administration",
  "Public Policy",
  "Law (Paralegal / Legal Assistant)",
  "Compliance & Regulatory Affairs",
  "Intelligence & National Security",
  "International Relations",
  "Political Consulting",
  "Education & Nonprofit",
  "Teaching / Education Administration",
  "Higher Education",
  "Nonprofit Management",
  "Philanthropy / Foundations",
  "Social Services",
  "Community Development",
  "International Development",
  "Real Estate, Hospitality & Consumer",
  "Real Estate",
  "Property Management",
  "Urban Planning",
  "Hospitality & Tourism",
  "Hotel Management",
  "Food & Beverage / Restaurants",
  "Event Planning",
  "Travel & Leisure",
  "Engineering & Manufacturing",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Industrial Engineering",
  "Manufacturing",
  "Supply Chain & Logistics",
  "Automotive",
  "Aerospace",
  "Finance",
  "Consulting",
  "Healthcare",
  "Retail & E-commerce",
  "Retail, E-commerce & Operations",
  "Retail Management",
  "E-commerce",
  "Merchandising / Buying",
  "Operations Management",
  "Customer Experience",
  "Procurement / Sourcing",
  "Other",
];

const COMPANIES_BY_INDUSTRY: Record<string, string[]> = {
  "Technology & Data": [
    "Google",
    "Amazon",
    "Microsoft",
    "Apple",
    "Meta",
    "Netflix",
    "Salesforce",
    "Adobe",
    "Uber",
    "Airbnb",
    "Stripe",
    "OpenAI",
    "Snap",
    "Pinterest",
    "TikTok",
    "Spotify",
    "Dropbox",
    "Atlassian",
    "Shopify",
    "Nvidia",
    "Intel",
    "Cisco",
    "Palantir",
    "Snowflake",
    "Databricks",
    "Twilio",
    "Zoom",
    "LinkedIn",
    "Reddit",
    "Other",
  ],
  "Software Development / Engineering": [
    "Google",
    "Microsoft",
    "Amazon",
    "Meta",
    "Apple",
    "Stripe",
    "Shopify",
    "Atlassian",
    "Other",
  ],
  "Information Technology (IT Support / Systems)": [
    "IBM",
    "Cisco",
    "Dell",
    "HP",
    "Oracle",
    "Other",
  ],
  Cybersecurity: [
    "CrowdStrike",
    "Palo Alto Networks",
    "Okta",
    "Fortinet",
    "Zscaler",
    "Other",
  ],
  "Data Analytics": [
    "Palantir",
    "Snowflake",
    "Databricks",
    "Tableau",
    "SAS",
    "Other",
  ],
  "Data Science": [
    "OpenAI",
    "Google",
    "Meta",
    "Microsoft",
    "Nvidia",
    "Other",
  ],
  "Artificial Intelligence / Machine Learning": [
    "OpenAI",
    "Anthropic",
    "Google DeepMind",
    "Microsoft",
    "Nvidia",
    "Other",
  ],
  "Cloud Computing / DevOps": [
    "AWS",
    "Google Cloud",
    "Microsoft Azure",
    "Snowflake",
    "Datadog",
    "Other",
  ],
  "Product Management": [
    "Google",
    "Meta",
    "Amazon",
    "Microsoft",
    "Apple",
    "Stripe",
    "Airbnb",
    "Other",
  ],
  "UX / UI Design": [
    "Apple",
    "Google",
    "Meta",
    "Adobe",
    "Airbnb",
    "Other",
  ],
  "QA / Testing": [
    "Google",
    "Microsoft",
    "Amazon",
    "Atlassian",
    "Other",
  ],
  "Web Development": [
    "Shopify",
    "Squarespace",
    "Wix",
    "WordPress",
    "Other",
  ],
  "Mobile App Development": [
    "Apple",
    "Google",
    "Meta",
    "Spotify",
    "Uber",
    "Other",
  ],
  "Healthcare & Life Sciences": [
    "UnitedHealth Group",
    "CVS Health",
    "Pfizer",
    "Johnson & Johnson",
    "Merck",
    "AbbVie",
    "Amgen",
    "Moderna",
    "Gilead",
    "Bristol Myers Squibb",
    "Other",
  ],
  "Hospital Administration": [
    "HCA Healthcare",
    "Ascension",
    "Tenet",
    "Other",
  ],
  Nursing: [
    "HCA Healthcare",
    "Kaiser Permanente",
    "Mayo Clinic",
    "Other",
  ],
  "Physician Assistant / Clinical Roles": [
    "Cleveland Clinic",
    "Mayo Clinic",
    "Kaiser Permanente",
    "Other",
  ],
  "Public Health": [
    "CDC",
    "WHO",
    "Local Health Department",
    "Other",
  ],
  "Health Consulting": [
    "Deloitte",
    "Accenture",
    "McKinsey & Company",
    "Other",
  ],
  "Health Informatics / Health IT": [
    "Epic",
    "Cerner",
    "Meditech",
    "Other",
  ],
  Pharmaceuticals: [
    "Pfizer",
    "Merck",
    "Johnson & Johnson",
    "Novartis",
    "Other",
  ],
  Biotechnology: [
    "Amgen",
    "Genentech",
    "Gilead",
    "Moderna",
    "Other",
  ],
  "Medical Devices": [
    "Medtronic",
    "Stryker",
    "Boston Scientific",
    "Other",
  ],
  "Clinical Research": [
    "IQVIA",
    "PPD",
    "ICON",
    "Other",
  ],
  "Healthcare Operations": [
    "UnitedHealth Group",
    "CVS Health",
    "Kaiser Permanente",
    "Other",
  ],
  "Mental Health Services": [
    "Headspace",
    "BetterHelp",
    "Talkspace",
    "Other",
  ],
  "Marketing, Sales & Communications": [
    "Google",
    "Meta",
    "Amazon",
    "Salesforce",
    "Other",
  ],
  "Marketing (Digital, Brand, Growth)": [
    "Google",
    "Meta",
    "TikTok",
    "Other",
  ],
  Advertising: [
    "WPP",
    "Omnicom",
    "Publicis",
    "Other",
  ],
  "Public Relations": [
    "Edelman",
    "Weber Shandwick",
    "FleishmanHillard",
    "Other",
  ],
  "Social Media Management": [
    "Meta",
    "TikTok",
    "Snap",
    "Other",
  ],
  "Content Creation": [
    "YouTube",
    "TikTok",
    "Spotify",
    "Other",
  ],
  "Sales (B2B / B2C / Tech Sales)": [
    "Salesforce",
    "HubSpot",
    "Oracle",
    "Other",
  ],
  "Business Development": [
    "Amazon",
    "Google",
    "Uber",
    "Other",
  ],
  "Market Research": [
    "Nielsen",
    "Ipsos",
    "GfK",
    "Other",
  ],
  "Event Marketing": [
    "Live Nation",
    "Cvent",
    "Other",
  ],
  "Media, Creative & Entertainment": [
    "Disney",
    "Warner Bros. Discovery",
    "NBCUniversal",
    "Other",
  ],
  "Film & Television Production": [
    "Disney",
    "Netflix",
    "Warner Bros. Discovery",
    "Other",
  ],
  "Music Industry": [
    "Spotify",
    "Universal Music Group",
    "Sony Music",
    "Other",
  ],
  Publishing: [
    "Penguin Random House",
    "HarperCollins",
    "Other",
  ],
  Journalism: [
    "The New York Times",
    "Washington Post",
    "Other",
  ],
  "Graphic Design": [
    "Adobe",
    "Canva",
    "Other",
  ],
  "Animation / Motion Graphics": [
    "Pixar",
    "DreamWorks",
    "Other",
  ],
  "Photography / Videography": [
    "Getty Images",
    "Shutterstock",
    "Other",
  ],
  "Creative Direction": [
    "Apple",
    "Nike",
    "Other",
  ],
  "Fashion Industry": [
    "Nike",
    "Lululemon",
    "Zara",
    "Other",
  ],
  "Government, Law & Policy": [
    "City Government",
    "State Government",
    "Federal Government",
    "Other",
  ],
  "Government & Public Administration": [
    "City Government",
    "State Government",
    "Federal Government",
    "Other",
  ],
  "Public Policy": [
    "Brookings",
    "Urban Institute",
    "Other",
  ],
  "Law (Paralegal / Legal Assistant)": [
    "Latham & Watkins",
    "Kirkland & Ellis",
    "Other",
  ],
  "Compliance & Regulatory Affairs": [
    "Deloitte",
    "EY",
    "KPMG",
    "Other",
  ],
  "Intelligence & National Security": [
    "NSA",
    "CIA",
    "Other",
  ],
  "International Relations": [
    "UN",
    "World Bank",
    "Other",
  ],
  "Political Consulting": [
    "Campaigns",
    "Political Consulting Firm",
    "Other",
  ],
  "Education & Nonprofit": [
    "Khan Academy",
    "Teach For America",
    "Other",
  ],
  "Teaching / Education Administration": [
    "Local School District",
    "Charter School",
    "Other",
  ],
  "Higher Education": [
    "University",
    "College",
    "Other",
  ],
  "Nonprofit Management": [
    "Red Cross",
    "United Way",
    "Other",
  ],
  "Philanthropy / Foundations": [
    "Gates Foundation",
    "Ford Foundation",
    "Other",
  ],
  "Social Services": [
    "YMCA",
    "Local Nonprofit",
    "Other",
  ],
  "Community Development": [
    "Community Organization",
    "Other",
  ],
  "International Development": [
    "USAID",
    "UNDP",
    "Other",
  ],
  "Real Estate, Hospitality & Consumer": [
    "Marriott",
    "Hilton",
    "Zillow",
    "Other",
  ],
  "Real Estate": [
    "Zillow",
    "Redfin",
    "Compass",
    "CBRE",
    "JLL",
    "Other",
  ],
  "Property Management": [
    "Greystar",
    "AvalonBay",
    "Other",
  ],
  "Urban Planning": [
    "City Planning Department",
    "Other",
  ],
  "Hospitality & Tourism": [
    "Marriott",
    "Hilton",
    "Hyatt",
    "Other",
  ],
  "Hotel Management": [
    "Marriott",
    "Hilton",
    "Hyatt",
    "Other",
  ],
  "Food & Beverage / Restaurants": [
    "Starbucks",
    "McDonald's",
    "Chipotle",
    "Other",
  ],
  "Event Planning": [
    "Live Nation",
    "Encore",
    "Other",
  ],
  "Travel & Leisure": [
    "Expedia",
    "Booking.com",
    "Other",
  ],
  "Engineering & Manufacturing": [
    "Boeing",
    "GE",
    "Siemens",
    "Other",
  ],
  "Mechanical Engineering": [
    "GE",
    "Siemens",
    "Other",
  ],
  "Electrical Engineering": [
    "Texas Instruments",
    "Siemens",
    "Other",
  ],
  "Civil Engineering": [
    "AECOM",
    "Jacobs",
    "Other",
  ],
  "Industrial Engineering": [
    "3M",
    "GE",
    "Other",
  ],
  Manufacturing: [
    "GE",
    "3M",
    "Boeing",
    "Other",
  ],
  "Supply Chain & Logistics": [
    "UPS",
    "FedEx",
    "DHL",
    "Other",
  ],
  Automotive: [
    "Tesla",
    "Ford",
    "GM",
    "Other",
  ],
  Aerospace: [
    "Boeing",
    "Lockheed Martin",
    "Northrop Grumman",
    "Other",
  ],
  Finance: [
    "Goldman Sachs",
    "JPMorgan Chase",
    "Morgan Stanley",
    "Bank of America",
    "Citigroup",
    "Wells Fargo",
    "BlackRock",
    "Vanguard",
    "Fidelity",
    "Capital One",
    "American Express",
    "Visa",
    "Mastercard",
    "Charles Schwab",
    "Bloomberg",
    "Robinhood",
    "Coinbase",
    "PayPal",
    "Other",
  ],
  Consulting: [
    "McKinsey & Company",
    "Bain & Company",
    "Boston Consulting Group",
    "Deloitte",
    "PwC",
    "EY",
    "KPMG",
    "Accenture",
    "Oliver Wyman",
    "LEK",
    "Roland Berger",
    "Other",
  ],
  Healthcare: [
    "UnitedHealth Group",
    "CVS Health",
    "Pfizer",
    "Johnson & Johnson",
    "Merck",
    "AbbVie",
    "Amgen",
    "Moderna",
    "Gilead",
    "Bristol Myers Squibb",
    "Medtronic",
    "Siemens Healthineers",
    "Cerner",
    "Other",
  ],
  "Retail & E-commerce": [
    "Walmart",
    "Target",
    "Costco",
    "Home Depot",
    "Best Buy",
    "Nike",
    "Lululemon",
    "Zara",
    "H&M",
    "IKEA",
    "Etsy",
    "Chewy",
    "Wayfair",
    "Other",
  ],
  "Retail, E-commerce & Operations": [
    "Walmart",
    "Target",
    "Amazon",
    "Costco",
    "Other",
  ],
  "Retail Management": [
    "Walmart",
    "Target",
    "Costco",
    "Other",
  ],
  "E-commerce": [
    "Amazon",
    "Shopify",
    "Etsy",
    "Other",
  ],
  "Merchandising / Buying": [
    "Target",
    "Walmart",
    "Nike",
    "Other",
  ],
  "Operations Management": [
    "Amazon",
    "Walmart",
    "Target",
    "Other",
  ],
  "Customer Experience": [
    "Amazon",
    "Apple",
    "Zappos",
    "Other",
  ],
  "Procurement / Sourcing": [
    "Walmart",
    "Target",
    "Costco",
    "Other",
  ],
  "Media & Entertainment": [
    "Disney",
    "Warner Bros. Discovery",
    "NBCUniversal",
    "Paramount",
    "Sony",
    "Roku",
    "Spotify",
    "YouTube",
    "ESPN",
    "Other",
  ],
  Education: [
    "Khan Academy",
    "Coursera",
    "edX",
    "Duolingo",
    "Other",
  ],
  "Government & Nonprofit": [
    "City Government",
    "State Government",
    "Federal Government",
    "UN",
    "World Bank",
    "Other",
  ],
  Other: ["Other"],
};

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
          value ? "bg-roome-core" : "bg-roome-core/20"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function OptionPicker({ selected, options, onSelect }: { selected: string; options: string[]; onSelect: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            selected === opt
              ? "bg-roome-core text-white"
              : "bg-roome-core/20 text-roome-core"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function sliderFill(value: number, min: number, max: number) {
  const pct = Math.round(((value - min) / (max - min)) * 100);
  return `linear-gradient(to right, #38b6ff 0%, #38b6ff ${pct}%, #D6ECFF ${pct}%, #D6ECFF 100%)`;
}

function toggleNeighborhood(value: string, selected: string[], setSelected: (v: string[]) => void) {
  if (selected.includes(value)) {
    setSelected(selected.filter((v) => v !== value));
  } else {
    setSelected([...selected, value]);
  }
}

function MultiSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            selected.includes(opt) ? "bg-roome-core text-white" : "bg-roome-pale text-roome-deep"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function NeighborhoodInput({
  value,
  onChange,
  onAdd,
  selected,
  onRemove,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: (v: string) => void;
  selected: string[];
  onRemove: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-600">Preferred Neighborhoods</label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Midtown, East Side…"
          className="flex-1 px-4 py-3 rounded-2xl bg-roome-pale border border-transparent focus:outline-none focus:ring-2 focus:ring-roome-core/40 focus:bg-white transition"
        />
        <button
          type="button"
          onClick={() => onAdd(value.trim())}
          className="px-4 py-3 rounded-2xl bg-roome-core text-white font-semibold"
        >
          Add
        </button>
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onRemove(n)}
              className="px-3 py-1.5 rounded-xl text-sm font-medium bg-roome-core text-white"
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
