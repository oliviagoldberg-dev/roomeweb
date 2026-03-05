"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { uploadOnboardingPhotos } from "@/lib/firebase/storage";
import { isUsernameAvailable } from "@/lib/firebase/firestore";
import { supabase } from "@/lib/supabase/client";
import { ProgressBar } from "./ProgressBar";
import { Button } from "@/components/ui/Button";
import { PhotoCropModal } from "@/components/ui/PhotoCropModal";
import {
  SLEEP_SCHEDULE_OPTIONS,
  WORK_FROM_HOME_OPTIONS,
  LEASE_LENGTH_OPTIONS,
  CLEANLINESS_LABELS,
  BEDS_OPTIONS,
  BATHS_OPTIONS,
  NEIGHBORHOODS_BY_CITY,
} from "@/lib/utils/constants";
import { Combobox } from "@/components/ui/Combobox";
import universities from "@/data/universities_us.json";
import cities from "@/data/us_major_cities.json";
import {
  Camera,
  Brain,
  Home,
  Heart,
  Check,
  Search,
  MessageSquare,
} from "lucide-react";

const STEP_TITLES = ["Welcome", "Photos", "Personal", "About You", "Lifestyle", "Home Requirements", "Bio", "Finish"];
const TOTAL = 8;

export function OnboardingWizard() {
  useAuth();
  const router = useRouter();
  const { uid, roommateUser, setRoommateUser } = useAuthStore();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Photos
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [mainPhotoIdx, setMainPhotoIdx] = useState(0);
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [cropIndex, setCropIndex] = useState(0);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  // Personal
  const [name, setName] = useState(roommateUser?.name ?? "");
  const [email, setEmail] = useState(roommateUser?.email ?? "");
  const [username, setUsername] = useState(roommateUser?.username ?? "");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");

  // About You
  const [occupation, setOccupation] = useState("");
  const [company, setCompany] = useState("");
  const [hometown, setHometown] = useState("");
  const [university, setUniversity] = useState("");

  // Lifestyle
  const [hasPet, setHasPet] = useState(false);
  const [smokes, setSmokes] = useState(false);
  const [host, setHost] = useState(false);
  const [workFromHome, setWorkFromHome] = useState("No, I go in");
  const [cleanliness, setCleanliness] = useState(3);
  const [sleepSchedule, setSleepSchedule] = useState("Flexible");

  // Home requirements
  const [budgetMin, setBudgetMin] = useState(800);
  const [budgetMax, setBudgetMax] = useState(1500);
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [furnished, setFurnished] = useState(false);
  const [leaseLength, setLeaseLength] = useState("12 months");
  const [hasAC, setHasAC] = useState(false);
  const [hasLaundry, setHasLaundry] = useState(false);
  const [hasParking, setHasParking] = useState(false);
  const [moveCity, setMoveCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  // Bio
  const [bio, setBio] = useState("");

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5);
    if (!files.length) return;
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setMainPhotoIdx(0);
    setCropQueue(files);
    setCropIndex(0);
    setCropFile(files[0]);
    setCropOpen(true);
  }

  function next() { setStep((s) => Math.min(s + 1, TOTAL - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  async function saveAndFinish() {
    if (!uid) { toast.error("Not logged in"); return; }
    const normalizedUsername = username.trim().toLowerCase();
    if (normalizedUsername) {
      const available = await isUsernameAvailable(normalizedUsername, uid);
      if (!available) {
        toast.error("That username is already taken.");
        return;
      }
    }
    setSaving(true);
    try {
      if (photoFiles.length < 5) {
        toast.error("Please upload 5 photos");
        return;
      }
      let photoURLs: string[] = [];
      if (photoFiles.length) photoURLs = await uploadOnboardingPhotos(uid, photoFiles);
      const mainUrl = photoURLs[mainPhotoIdx] ?? photoURLs[0] ?? "";
      const reordered = mainUrl ? [mainUrl, ...photoURLs.filter((_, i) => i !== mainPhotoIdx)] : photoURLs;

      const data = {
        uid, name: name.trim(), email: email.trim(), username: normalizedUsername, phone, age,
        occupation, company, hometown, university,
        hasPet, smokes, host, workFromHome, cleanliness, sleepSchedule,
        budgetMin, budgetMax, beds, baths, furnished, leaseLength,
        hasAC, hasLaundry, hasParking, moveCity, neighborhood,
        bio, photoURLs: reordered,
        profileImageURL: reordered[0] ?? "",
        connections: [],
        likedBy: [],
        onboardingComplete: true,
      };
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expired. Please log in again.");
      const res = await fetch("/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save");
      }
      setRoommateUser({ ...data, id: uid } as never);
      router.push("/home");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0: return <WelcomeStep />;
      case 1: return <PhotosStep previews={photoPreviews} onChange={handlePhotoChange} mainIdx={mainPhotoIdx} onSelectMain={setMainPhotoIdx} />;
      case 2: return (
        <PersonalStep
          name={name} setName={setName}
          email={email} setEmail={setEmail}
          username={username} setUsername={setUsername}
          phone={phone} setPhone={setPhone}
          age={age} setAge={setAge}
        />
      );
      case 3: return (
        <AboutStep
          occupation={occupation} setOccupation={setOccupation}
          company={company} setCompany={setCompany}
          hometown={hometown} setHometown={setHometown}
          university={university} setUniversity={setUniversity}
        />
      );
      case 4: return (
        <LifestyleStep
          hasPet={hasPet} setHasPet={setHasPet}
          smokes={smokes} setSmokes={setSmokes}
          host={host} setHost={setHost}
          workFromHome={workFromHome} setWorkFromHome={setWorkFromHome}
          cleanliness={cleanliness} setCleanliness={setCleanliness}
          sleepSchedule={sleepSchedule} setSleepSchedule={setSleepSchedule}
        />
      );
      case 5: return (
        <HomeRequirementsStep
          budgetMin={budgetMin} setBudgetMin={setBudgetMin}
          budgetMax={budgetMax} setBudgetMax={setBudgetMax}
          beds={beds} setBeds={setBeds}
          baths={baths} setBaths={setBaths}
          furnished={furnished} setFurnished={setFurnished}
          leaseLength={leaseLength} setLeaseLength={setLeaseLength}
          hasAC={hasAC} setHasAC={setHasAC}
          hasLaundry={hasLaundry} setHasLaundry={setHasLaundry}
          hasParking={hasParking} setHasParking={setHasParking}
          moveCity={moveCity} setMoveCity={(v) => { setMoveCity(v); setNeighborhood(""); }}
          neighborhood={neighborhood} setNeighborhood={setNeighborhood}
        />
      );
      case 6: return <BioStep bio={bio} setBio={setBio} />;
      case 7: return <FinishStep />;
      default: return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-roome-offwhite flex flex-col">
      {step > 0 && (
        <ProgressBar step={step} total={TOTAL} label={STEP_TITLES[step]} onSkip={step < TOTAL - 1 ? next : undefined} />
      )}
      <div className="flex-1 overflow-y-auto px-6 py-4">{renderStep()}</div>
      <div className="px-6 pb-[env(safe-area-inset-bottom,24px)] pt-4 flex gap-3 mb-4">
        {step > 0 && (
          <Button variant="secondary" onClick={back} className="flex-1" size="lg">Back</Button>
        )}
        <Button onClick={step < TOTAL - 1 ? next : saveAndFinish} loading={saving} className="flex-1" size="lg">
          {step === 0 ? "Get Started" : step < TOTAL - 1 ? "Next" : "Finish"}
        </Button>
      </div>
      <PhotoCropModal
        open={cropOpen}
        file={cropFile}
        onCancel={() => setCropOpen(false)}
        onComplete={(file, previewUrl) => {
          setPhotoFiles((prev) => [...prev, file]);
          setPhotoPreviews((prev) => [...prev, previewUrl]);
          const nextIndex = cropIndex + 1;
          if (nextIndex < cropQueue.length) {
            setCropIndex(nextIndex);
            setCropFile(cropQueue[nextIndex]);
          } else {
            setCropOpen(false);
            setCropFile(null);
          }
        }}
      />
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function WelcomeStep() {
  return (
    <div className="space-y-6 py-8 text-center">
      <h1 className="text-4xl font-black font-heading">Welcome to ROOMe</h1>
      <p className="text-gray-500">Let&apos;s build your profile so we can find your perfect roommate match.</p>
      <div className="space-y-3 text-left bg-white rounded-2xl p-5 shadow-sm">
        {[
          { Icon: Camera, text: "Add up to 5 photos" },
          { Icon: Brain, text: "Share your lifestyle preferences" },
          { Icon: Home, text: "Set your home requirements" },
          { Icon: Heart, text: "Get matched with compatible roommates" },
        ].map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-3 font-medium">
            <Icon className="w-5 h-5 text-roome-core" />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotosStep({ previews, onChange, mainIdx, onSelectMain }: {
  previews: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mainIdx: number;
  onSelectMain: (i: number) => void;
}) {
  return (
    <div className="space-y-5 py-4">
      <p className="text-sm text-gray-500 text-center">Upload 5 photos · Tap a photo to set your profile picture</p>
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-roome-pale flex items-center justify-center">
        {previews[mainIdx]
          ? <img src={previews[mainIdx]} alt="" className="w-full h-full object-cover" />
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
              onClick={() => onSelectMain(idx)}
              className={`aspect-square rounded-xl overflow-hidden bg-roome-pale flex items-center justify-center ${mainIdx === idx ? "ring-2 ring-roome-core" : ""}`}
            >
              {previews[idx]
                ? <img src={previews[idx]} alt="" className="w-full h-full object-cover" />
                : <span className="text-roome-deep/30 text-2xl">+</span>
              }
            </button>
          );
        })}
      </div>
      <label className="block text-center">
        <span className="inline-block bg-roome-core/20 text-roome-core font-semibold px-6 py-3 text-base rounded-2xl cursor-pointer hover:bg-roome-core/30 transition-colors focus:outline-none focus:ring-2 focus:ring-roome-core/50">
          Choose Photos (5)
        </span>
        <input type="file" accept="image/*" multiple className="hidden" onChange={onChange} />
      </label>
    </div>
  );
}

function PersonalStep({ name, setName, email, setEmail, username, setUsername, phone, setPhone, age, setAge }: {
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  username: string; setUsername: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  age: string; setAge: (v: string) => void;
}) {
  return (
    <div className="space-y-4 py-4">
      <h2 className="text-2xl font-bold font-heading text-center">Personal Info</h2>
      <Field label="Full Name" placeholder="Your full name" value={name} onChange={setName} />
      <Field label="Email" placeholder="your@email.com" value={email} onChange={setEmail} type="email" />
      <Field label="Username" placeholder="@yourhandle" value={username}
        onChange={(v) => setUsername(v.toLowerCase().replace(/\s/g, ""))} />
      <Field label="Phone Number" placeholder="+1 (555) 000-0000" value={phone} onChange={setPhone} type="tel" />
      <Field label="Age" placeholder="e.g. 24" value={age} onChange={setAge} type="number" />
    </div>
  );
}

function AboutStep({ occupation, setOccupation, company, setCompany, hometown, setHometown, university, setUniversity }: {
  occupation: string; setOccupation: (v: string) => void;
  company: string; setCompany: (v: string) => void;
  hometown: string; setHometown: (v: string) => void;
  university: string; setUniversity: (v: string) => void;
}) {
  return (
    <div className="space-y-4 py-4">
      <h2 className="text-2xl font-bold font-heading text-center">About You</h2>
      <Field label="Job Title" placeholder="e.g. Product Designer" value={occupation} onChange={setOccupation} />
      <Field label="Company" placeholder="e.g. Google" value={company} onChange={setCompany} />
      <Field label="Hometown" placeholder="e.g. Austin, TX" value={hometown} onChange={setHometown} />
      <Combobox
        label="College / University"
        placeholder="Search your school…"
        value={university}
        onChange={setUniversity}
        options={universities}
      />
    </div>
  );
}

function LifestyleStep(props: {
  hasPet: boolean; setHasPet: (v: boolean) => void;
  smokes: boolean; setSmokes: (v: boolean) => void;
  host: boolean; setHost: (v: boolean) => void;
  workFromHome: string; setWorkFromHome: (v: string) => void;
  cleanliness: number; setCleanliness: (v: number) => void;
  sleepSchedule: string; setSleepSchedule: (v: string) => void;
}) {
  return (
    <div className="space-y-4 py-4">
      <h2 className="text-2xl font-bold font-heading text-center">Your Lifestyle</h2>
      <Card>
        <Toggle label="Do you have a pet?" value={props.hasPet} onChange={props.setHasPet} />
      </Card>
      <Card>
        <Toggle label="Do you smoke?" value={props.smokes} onChange={props.setSmokes} />
      </Card>
      <Card>
        <Toggle label="Do you like to host?" value={props.host} onChange={props.setHost} />
      </Card>
      <Card>
        <p className="font-semibold mb-2">Work from home?</p>
        <OptionPicker selected={props.workFromHome} options={[...WORK_FROM_HOME_OPTIONS]} onSelect={props.setWorkFromHome} />
      </Card>
      <Card>
        <p className="font-semibold mb-2">Sleep Schedule</p>
        <OptionPicker selected={props.sleepSchedule} options={[...SLEEP_SCHEDULE_OPTIONS]} onSelect={props.setSleepSchedule} />
      </Card>
      <Card>
        <p className="font-semibold mb-2">Cleanliness</p>
        <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Relaxed</span><span>Super tidy</span></div>
        <input type="range" min={1} max={5} step={1} value={props.cleanliness}
          onChange={(e) => props.setCleanliness(Number(e.target.value))}
          className="w-full accent-roome-core" />
        <p className="text-xs text-roome-core font-medium mt-1">{CLEANLINESS_LABELS[props.cleanliness]}</p>
      </Card>
    </div>
  );
}

function HomeRequirementsStep(props: {
  budgetMin: number; setBudgetMin: (v: number) => void;
  budgetMax: number; setBudgetMax: (v: number) => void;
  beds: string; setBeds: (v: string) => void;
  baths: string; setBaths: (v: string) => void;
  furnished: boolean; setFurnished: (v: boolean) => void;
  leaseLength: string; setLeaseLength: (v: string) => void;
  hasAC: boolean; setHasAC: (v: boolean) => void;
  hasLaundry: boolean; setHasLaundry: (v: boolean) => void;
  hasParking: boolean; setHasParking: (v: boolean) => void;
  moveCity: string; setMoveCity: (v: string) => void;
  neighborhood: string; setNeighborhood: (v: string) => void;
}) {
  const neighborhoodOptions = NEIGHBORHOODS_BY_CITY[props.moveCity] ?? [];

  return (
    <div className="space-y-4 py-4">
      <h2 className="text-2xl font-bold font-heading text-center">Home Requirements</h2>

      <Card>
        <p className="font-semibold mb-1">Rent Range</p>
        <p className="text-2xl font-black text-roome-core text-center my-2">
          ${props.budgetMin.toLocaleString()} – ${props.budgetMax.toLocaleString()}<span className="text-base font-normal text-gray-400">/mo</span>
        </p>
        <label className="text-xs text-gray-500">Min: ${props.budgetMin}</label>
        <input type="range" min={500} max={5000} step={50} value={props.budgetMin}
          onChange={(e) => props.setBudgetMin(Number(e.target.value))}
          className="w-full accent-roome-core mt-1" />
        <label className="text-xs text-gray-500 block mt-2">Max: ${props.budgetMax}</label>
        <input type="range" min={500} max={5000} step={50} value={props.budgetMax}
          onChange={(e) => props.setBudgetMax(Number(e.target.value))}
          className="w-full accent-roome-core mt-1" />
      </Card>

      <Card>
        <p className="font-semibold mb-2">Bedrooms</p>
        <OptionPicker selected={props.beds} options={[...BEDS_OPTIONS]} onSelect={props.setBeds} />
      </Card>

      <Card>
        <p className="font-semibold mb-2">Bathrooms</p>
        <OptionPicker selected={props.baths} options={[...BATHS_OPTIONS]} onSelect={props.setBaths} />
      </Card>

      <Card>
        <p className="font-semibold mb-2">Lease Length</p>
        <OptionPicker selected={props.leaseLength} options={[...LEASE_LENGTH_OPTIONS]} onSelect={props.setLeaseLength} />
      </Card>

      <Card>
        <Toggle label="Need it furnished?" value={props.furnished} onChange={props.setFurnished} />
      </Card>

      <Card>
        <p className="font-semibold mb-3">Amenities Needed</p>
        <div className="space-y-3">
          <Toggle label="AC / Air Conditioning" value={props.hasAC} onChange={props.setHasAC} />
          <Toggle label="In-unit Laundry" value={props.hasLaundry} onChange={props.setHasLaundry} />
          <Toggle label="Parking" value={props.hasParking} onChange={props.setHasParking} />
        </div>
      </Card>

      <Combobox
        label="Target City"
        placeholder="Where are you moving?"
        value={props.moveCity}
        onChange={props.setMoveCity}
        options={cities}
      />

      {neighborhoodOptions.length > 0 ? (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">Preferred Neighborhood</label>
          <select
            value={props.neighborhood}
            onChange={(e) => props.setNeighborhood(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-roome-offwhite focus:outline-none focus:ring-2 focus:ring-roome-core/40"
          >
            <option value="">Select a neighborhood…</option>
            {neighborhoodOptions.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      ) : props.moveCity ? (
        <Field label="Preferred Neighborhood" placeholder="e.g. Midtown, East Side…"
          value={props.neighborhood} onChange={props.setNeighborhood} />
      ) : null}
    </div>
  );
}

function BioStep({ bio, setBio }: { bio: string; setBio: (v: string) => void }) {
  return (
    <div className="space-y-4 py-4">
      <h2 className="text-2xl font-bold font-heading text-center">Tell people about yourself</h2>
      <p className="text-center text-gray-500 text-sm">What should potential roommates know about you?</p>
      <Card>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 300))}
          placeholder="I'm a grad student who loves hiking, cooking, and keeping things tidy…"
          rows={5}
          className="w-full resize-none bg-roome-offwhite rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-roome-core/40"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/300</p>
      </Card>
    </div>
  );
}

function FinishStep() {
  return (
    <div className="space-y-6 py-8 text-center">
      <h1 className="text-4xl font-black font-heading">You&apos;re all set!</h1>
      <p className="text-gray-500">Your profile is ready. Time to find your perfect roommate.</p>
      <div className="space-y-3 text-left bg-white rounded-2xl p-5 shadow-sm">
        {[
          { Icon: Check, text: "Profile created" },
          { Icon: Search, text: "Start browsing roommates" },
          { Icon: MessageSquare, text: "Message your matches" },
          { Icon: Home, text: "Find your perfect place" },
        ].map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-3 font-medium">
            <Icon className="w-5 h-5 text-roome-core" />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl p-4 shadow-sm">{children}</div>;
}

function Field({ label, placeholder, value, onChange, type = "text" }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl bg-roome-offwhite border border-transparent focus:outline-none focus:ring-2 focus:ring-roome-core/40 focus:bg-white transition"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium">{label}</span>
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
            selected === opt ? "bg-roome-core text-white" : "bg-roome-pale text-roome-deep"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
