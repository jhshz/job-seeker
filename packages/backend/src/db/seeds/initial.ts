// packages/backend/src/db/seeds/initial.ts
import mongoose from "mongoose";
import {
  User,
  RecruiterProfile,
  SeekerProfile,
  Job,
  JobApplication,
  Resume,
  FileUpload,
  SavedJob,
} from "../../models/index";
import { UserRole, UserStatus, JobStatus, JobType, ApplicationStatus, FileKind } from "../../enums/index";
import { hashPassword } from "../../utils/hash";
import { randomInt, pick, shuffle } from "../../utils/random";


const CITIES = [
  "تهران",
  "اصفهان",
  "شیراز",
  "مشهد",
  "تبریز",
  "کرج",
  "یزد",
  "رشت",
  "اهواز",
  "قم",
];

const COMPANY_NAMES = [
  "دیجی‌کالا",
  "اسنپ",
  "کافه‌بازار",
  "تپسی",
  "دیوار",
  "ابرآروان",
  "فروشگاه آنلاین نگار",
  "استارتاپ فناوری پارس",
];

const JOB_TITLES_FA = [
  "برنامه‌نویس فرانت‌اند",
  "برنامه‌نویس بک‌اند نود",
  "کارشناس منابع انسانی",
  "طراح UI/UX",
  "کارشناس سئو",
  "مدیر محصول",
  "ادمین وردپرس",
  "کارشناس فروش",
  "تحلیلگر داده",
  "توسعه‌دهنده فول‌استک",
  "مدیر پروژه",
  "پشتیبان فنی",
];

const SKILLS_FA = [
  "React",
  "TypeScript",
  "Node.js",
  "Express",
  "MongoDB",
  "PostgreSQL",
  "Docker",
  "Git",
  "Scrum",
  "UI Design",
];

const JOB_TYPES = [JobType.FULL_TIME, JobType.PART_TIME, JobType.CONTRACT, JobType.REMOTE, JobType.HYBRID] as const;
const JOB_STATUSES = [JobStatus.DRAFT, JobStatus.PUBLISHED, JobStatus.CLOSED] as const;
const APP_STATUSES = [ApplicationStatus.APPLIED, ApplicationStatus.REVIEWING, ApplicationStatus.INTERVIEW, ApplicationStatus.OFFERED, ApplicationStatus.REJECTED] as const;

const DEGREES_FA = ["کارشناسی", "کارشناسی ارشد", "دکتری"];
const FIELDS_FA = ["مهندسی کامپیوتر", "مدیریت کسب‌وکار", "طراحی صنعتی", "علوم داده"];
const INSTITUTIONS_FA = ["دانشگاه تهران", "دانشگاه شریف", "دانشگاه امیرکبیر", "دانشگاه اصفهان"];

export interface SeedOptions {
  recruiters: number;
  jobsPerRecruiter: number;
  seekers: number;
}

function phoneE164(index: number): string {
  const n = 910000000 + (index % 90000000);
  return `+98${n}`;
}

export async function runSeed(opts: SeedOptions): Promise<void> {
  const { recruiters, jobsPerRecruiter, seekers } = opts;

  const defaultPasswordHash = await hashPassword("Test@1234");

  const recruiterProfiles: mongoose.Types.ObjectId[] = [];
  const seekerProfiles: mongoose.Types.ObjectId[] = [];
  const jobsByRecruiter: mongoose.Types.ObjectId[][] = [];
  const allJobIds: mongoose.Types.ObjectId[] = [];
  const seekerResumes: { seekerId: mongoose.Types.ObjectId; resumeIds: mongoose.Types.ObjectId[] }[] = [];

  for (let i = 0; i < recruiters; i++) {
    const u = await User.create({
      phoneE164: phoneE164(100 + i),
      passwordHash: defaultPasswordHash,
      isPhoneVerified: true,
      status: UserStatus.ACTIVE,
      roles: [UserRole.RECRUITER],
    });

    const logo = await FileUpload.create({
      ownerId: u._id,
      kind: FileKind.LOGO,
      storageKey: `seed/logo-${u._id.toString()}.png`,
      url: `https://example.com/logos/${u._id.toString()}.png`,
      mime: "image/png",
      size: 1024,
      checksum: `seed-checksum-${u._id.toString()}`,
      originalName: "لوگو.png",
    });

    const companyName = pick(COMPANY_NAMES) + (i > 0 ? ` ${i}` : "");
    const rp = await RecruiterProfile.create({
      userId: u._id,
      companyName,
      companyDescription: `شرکت ${companyName} فعال در حوزه فناوری و نوآوری. ما به دنبال نیروی متخصص هستیم.`,
      website: `https://${companyName.replace(/\s/g, "")}.ir`,
      logoFileId: logo._id,
      location: pick(CITIES),
      industry: "فناوری اطلاعات",
      size: pick(["۱–۱۰", "۱۱–۵۰", "۵۱–۲۰۰"]),
    });
    recruiterProfiles.push(rp._id);
    jobsByRecruiter.push([]);
  }

  for (let r = 0; r < recruiters; r++) {
    const recruiterId = recruiterProfiles[r]!;
    for (let j = 0; j < jobsPerRecruiter; j++) {
      const status = pick(JOB_STATUSES);
      const types = [pick(JOB_TYPES)];
      if (randomInt(0, 1)) types.push(pick(JOB_TYPES));
      const title = pick(JOB_TITLES_FA);
      const job = await Job.create({
        recruiterId,
        title,
        description: `شرح موقعیت شغلی برای ${title} در تیم ما. مسئولیت‌ها و شرایط را مطالعه کنید.`,
        status,
        type: [...new Set(types)],
        location: pick(CITIES),
        salaryMin: status !== JobStatus.DRAFT ? randomInt(20, 80) * 1_000_000 : null,
        salaryMax: status !== JobStatus.DRAFT ? randomInt(100, 150) * 1_000_000 : null,
        salaryCurrency: "IRR",
        salaryPeriod: "monthly",
        showSalary: status === JobStatus.PUBLISHED && randomInt(0, 1) === 1,
        tags: shuffle([...SKILLS_FA]).slice(0, randomInt(2, 5)),
      });
      jobsByRecruiter[r]!.push(job._id);
      allJobIds.push(job._id);
    }
  }

  for (let i = 0; i < seekers; i++) {
    const u = await User.create({
      phoneE164: phoneE164(200 + i),
      passwordHash: defaultPasswordHash,
      isPhoneVerified: true,
      status: UserStatus.ACTIVE,
      roles: [UserRole.SEEKER],
    });

    const avatar = await FileUpload.create({
      ownerId: u._id,
      kind: FileKind.AVATAR,
      storageKey: `seed/avatar-${u._id.toString()}.jpg`,
      url: `https://example.com/avatars/${u._id.toString()}.jpg`,
      mime: "image/jpeg",
      size: 2048,
      checksum: `seed-av-${u._id.toString()}`,
      originalName: "تصویر.jpg",
    });

    const fullName = pick(["علی محمدی", "مریم احمدی", "رضا کریمی", "سارا موسوی", "امیر حسینی"]) + (i > 0 ? ` ${i}` : "");
    const sp = await SeekerProfile.create({
      userId: u._id,
      fullName,
      headline: pick(JOB_TITLES_FA),
      location: pick(CITIES),
      about: `متخصص با تجربه در زمینه توسعه نرم‌افزار و همکاری تیمی.`,
      skills: shuffle([...SKILLS_FA]).slice(0, randomInt(3, 6)),
      education: [
        {
          institution: pick(INSTITUTIONS_FA),
          degree: pick(DEGREES_FA),
          field: pick(FIELDS_FA),
          startYear: 2015,
          endYear: 2019,
          description: "گرایش نرم‌افزار",
        },
      ],
      experience: [
        {
          company: pick(COMPANY_NAMES),
          title: pick(JOB_TITLES_FA),
          location: pick(CITIES),
          startDate: new Date("2020-01-01"),
          endDate: new Date("2023-06-01"),
          current: false,
          description: "توسعه و نگهداری سرویس‌های وب",
        },
      ],
      avatarFileId: avatar._id,
    });
    seekerProfiles.push(sp._id);

    const resumeIds: mongoose.Types.ObjectId[] = [];
    for (let v = 1; v <= 2; v++) {
      const res = await Resume.create({
        seekerId: sp._id,
        version: v,
        isActive: v === 2,
        fullName: sp.fullName,
        headline: sp.headline,
        location: sp.location,
        about: sp.about,
        skills: sp.skills,
        education: sp.education,
        experience: sp.experience,
        fileId: null,
      });
      resumeIds.push(res._id);
    }
    seekerResumes.push({ seekerId: sp._id, resumeIds });
  }

  const publishedJobs = await Job.find({ status: JobStatus.PUBLISHED }).select("_id").lean().exec();
  const pubIds = publishedJobs.map((j) => j._id);

  for (const { seekerId, resumeIds } of seekerResumes) {
    const activeResumeId = resumeIds[resumeIds.length - 1]!;
    const applied = new Set<string>();
    const numApply = randomInt(3, Math.min(8, pubIds.length));
    const shuffled = shuffle([...pubIds]);
    for (let a = 0; a < numApply && a < shuffled.length; a++) {
      const jobId = shuffled[a]!;
      const key = `${jobId.toString()}-${seekerId.toString()}`;
      if (applied.has(key)) continue;
      applied.add(key);
      await JobApplication.create({
        jobId,
        seekerId,
        resumeSnapshotId: activeResumeId,
        status: pick(APP_STATUSES),
        coverLetter: "با سلام، با توجه به تجربه و مهارت‌های من، متقاضی این موقعیت شغلی هستم.",
      });
    }
  }

  for (const { seekerId } of seekerResumes) {
    const toSave = shuffle([...pubIds]).slice(0, randomInt(1, 4));
    for (const jobId of toSave) {
      try {
        await SavedJob.create({ seekerId, jobId });
      } catch {
        // duplicate ignore
      }
    }
  }
}
