import swaggerUi from "swagger-ui-express";
import type { Express } from "express";
import { config } from "@configs";

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Jobbama API",
    version: "1.0.0",
    description: "Jobbama (جاب با ما) - API for job seekers and recruiters to manage profiles, jobs, and applications.",
  },
  servers: [
    { url: "http://localhost:" + config.PORT, description: "Local server" },
  ],
  tags: [
    { name: "Auth", description: "Authentication and session management" },
    { name: "Health", description: "Health check endpoints" },
    { name: "Jobs", description: "Job listings and applications" },
    { name: "Recruiters", description: "Recruiter profile and job management" },
    { name: "Seekers", description: "Job seeker profile and applications (Jobbama)" },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        status: { type: "string", example: "healthy" },
                        app: { type: "string" },
                        environment: { type: "string" },
                        timestamp: { type: "string", format: "date-time" },
                        uptime: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/otp/request": {
      post: {
        tags: ["Auth"],
        summary: "Request OTP",
        description: "Send OTP to phone number for login or register. Rate limited.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["phoneE164", "purpose"],
                properties: {
                  phoneE164: { type: "string", example: "+989123456789", description: "E.164 format" },
                  purpose: { type: "string", enum: ["login", "register"] },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OTP sent",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        requestId: { type: "string" },
                        message: { type: "string" },
                        expiresAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/otp/verify": {
      post: {
        tags: ["Auth"],
        summary: "Verify OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["phoneE164", "purpose", "code"],
                properties: {
                  phoneE164: { type: "string", example: "+989123456789" },
                  purpose: { type: "string", enum: ["login", "register"] },
                  code: { type: "string", pattern: "^\\d{6}$", description: "6-digit OTP" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                        accessToken: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Password login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["phoneE164", "password"],
                properties: {
                  phoneE164: { type: "string", example: "+989123456789" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                        accessToken: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/password/set": {
      post: {
        tags: ["Auth"],
        summary: "Set password",
        description: "Set or update password. Requires authentication.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["newPassword"],
                properties: {
                  newPassword: { type: "string", minLength: 8, maxLength: 128 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Password set successfully" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        description: "Uses refresh token from cookie or body.",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { refreshToken: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "New access token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        accessToken: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        requestBody: { content: { "application/json": { schema: { type: "object" } } } },
        responses: { "200": { description: "Logged out" } },
      },
    },
    "/api/auth/logout-all": {
      post: {
        tags: ["Auth"],
        summary: "Logout from all devices",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "All sessions invalidated" } },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/jobs": {
      get: {
        tags: ["Jobs"],
        summary: "List jobs",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "q", in: "query", schema: { type: "string" }, description: "Search query" },
          { name: "location", in: "query", schema: { type: "string" } },
          { name: "type", in: "query", schema: { type: "string" } },
          { name: "tags", in: "query", schema: { type: "string" }, description: "Comma-separated" },
          { name: "salaryMin", in: "query", schema: { type: "number" } },
          { name: "salaryMax", in: "query", schema: { type: "number" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["draft", "published", "closed"] } },
        ],
        responses: {
          "200": {
            description: "Paginated job list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedJobs" },
              },
            },
          },
        },
      },
    },
    "/api/jobs/{jobId}": {
      get: {
        tags: ["Jobs"],
        summary: "Get job by ID",
        parameters: [{ name: "jobId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Job details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Job" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Jobs"],
        summary: "Apply to job",
        description: "Requires seeker role.",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "jobId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["resumeId"],
                properties: {
                  resumeId: { type: "string" },
                  coverLetter: { type: "string", maxLength: 2000 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Application submitted" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - seeker role required" },
        },
      },
    },
    "/api/recruiters/me": {
      get: {
        tags: ["Recruiters"],
        summary: "Get recruiter profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Recruiter profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/RecruiterProfile" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - recruiter role required" },
        },
      },
      patch: {
        tags: ["Recruiters"],
        summary: "Update recruiter profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  companyName: { type: "string", maxLength: 200 },
                  companyDescription: { type: "string", maxLength: 5000 },
                  website: { type: "string", format: "uri", maxLength: 500 },
                  logoFileId: { type: "string", nullable: true },
                  location: { type: "string", maxLength: 200 },
                  industry: { type: "string", maxLength: 100 },
                  size: { type: "string", maxLength: 50 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Profile updated" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/recruiters/{recruiterId}": {
      get: {
        tags: ["Recruiters"],
        summary: "Get recruiter public profile",
        parameters: [{ name: "recruiterId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Recruiter public profile and jobs",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        recruiter: { $ref: "#/components/schemas/RecruiterProfile" },
                        jobs: { type: "array", items: { $ref: "#/components/schemas/Job" } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/recruiters/jobs": {
      get: {
        tags: ["Recruiters"],
        summary: "List recruiter's jobs",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Recruiter's job list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        jobs: { type: "array", items: { $ref: "#/components/schemas/Job" } },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
      post: {
        tags: ["Recruiters"],
        summary: "Create job",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateJob" },
            },
          },
        },
        responses: {
          "201": { description: "Job created" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/recruiters/jobs/{jobId}": {
      patch: {
        tags: ["Recruiters"],
        summary: "Update job",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "jobId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateJob" },
            },
          },
        },
        responses: {
          "200": { description: "Job updated" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/recruiters/jobs/{jobId}/applications": {
      get: {
        tags: ["Recruiters"],
        summary: "List job applications",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "jobId", in: "path", required: true, schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "status", in: "query", schema: { type: "string", enum: ["applied", "reviewing", "interview", "offered", "rejected", "withdrawn"] } },
        ],
        responses: {
          "200": {
            description: "Paginated applications",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedApplications" },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/seekers/me": {
      get: {
        tags: ["Seekers"],
        summary: "Get seeker profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Seeker profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/SeekerProfile" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - seeker role required" },
        },
      },
      patch: {
        tags: ["Seekers"],
        summary: "Update seeker profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string", maxLength: 200 },
                  headline: { type: "string", maxLength: 300 },
                  location: { type: "string", maxLength: 200 },
                  about: { type: "string", maxLength: 5000 },
                  skills: { type: "array", items: { type: "string" }, maxItems: 50 },
                  education: { type: "array", items: { $ref: "#/components/schemas/EducationEntry" } },
                  experience: { type: "array", items: { $ref: "#/components/schemas/ExperienceEntry" } },
                  avatarFileId: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Profile updated" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/seekers/me/applications": {
      get: {
        tags: ["Seekers"],
        summary: "Get my applications",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "status", in: "query", schema: { type: "string", enum: ["applied", "reviewing", "interview", "offered", "rejected", "withdrawn"] } },
        ],
        responses: {
          "200": {
            description: "Paginated applications",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedApplications" },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/seekers/me/resumes": {
      get: {
        tags: ["Seekers"],
        summary: "List my resumes",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Resume list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        resumes: { type: "array", items: { $ref: "#/components/schemas/Resume" } },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
      post: {
        tags: ["Seekers"],
        summary: "Create resume",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateResume" },
            },
          },
        },
        responses: {
          "201": { description: "Resume created" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/seekers/me/resumes/{resumeId}/activate": {
      patch: {
        tags: ["Seekers"],
        summary: "Activate resume",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "resumeId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Resume activated" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT access token",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          phoneE164: { type: "string" },
          role: { type: "string", enum: ["seeker", "recruiter"] },
          hasPassword: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Job: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["draft", "published", "closed"] },
          type: { type: "array", items: { type: "string" } },
          location: { type: "string" },
          salaryMin: { type: "number", nullable: true },
          salaryMax: { type: "number", nullable: true },
          salaryCurrency: { type: "string" },
          salaryPeriod: { type: "string" },
          showSalary: { type: "boolean" },
          tags: { type: "array", items: { type: "string" } },
          recruiter: { type: "object" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateJob: {
        type: "object",
        required: ["title", "description"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          description: { type: "string", minLength: 1 },
          status: { type: "string", enum: ["draft", "published", "closed"], default: "draft" },
          type: {
            type: "array",
            items: { type: "string", enum: ["full-time", "part-time", "contract", "internship", "freelance", "remote", "hybrid"] },
            default: [],
          },
          location: { type: "string", default: "" },
          salaryMin: { type: "number", nullable: true },
          salaryMax: { type: "number", nullable: true },
          salaryCurrency: { type: "string", default: "IRR" },
          salaryPeriod: { type: "string", enum: ["hourly", "monthly", "yearly"], default: "monthly" },
          showSalary: { type: "boolean", default: false },
          tags: { type: "array", items: { type: "string", maxLength: 50 }, default: [] },
        },
      },
      UpdateJob: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          description: { type: "string", minLength: 1 },
          status: { type: "string", enum: ["draft", "published", "closed"] },
          type: { type: "array", items: { type: "string" } },
          location: { type: "string" },
          salaryMin: { type: "number", nullable: true },
          salaryMax: { type: "number", nullable: true },
          salaryCurrency: { type: "string" },
          salaryPeriod: { type: "string", enum: ["hourly", "monthly", "yearly"] },
          showSalary: { type: "boolean" },
          tags: { type: "array", items: { type: "string" } },
        },
      },
      RecruiterProfile: {
        type: "object",
        properties: {
          id: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
          companyName: { type: "string" },
          companyDescription: { type: "string" },
          website: { type: "string" },
          logoFileId: { type: "string", nullable: true },
          location: { type: "string" },
          industry: { type: "string" },
          size: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      SeekerProfile: {
        type: "object",
        properties: {
          id: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
          fullName: { type: "string" },
          headline: { type: "string" },
          location: { type: "string" },
          about: { type: "string" },
          skills: { type: "array", items: { type: "string" } },
          education: { type: "array", items: { $ref: "#/components/schemas/EducationEntry" } },
          experience: { type: "array", items: { $ref: "#/components/schemas/ExperienceEntry" } },
          avatarFileId: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Resume: {
        type: "object",
        properties: {
          id: { type: "string" },
          fullName: { type: "string" },
          headline: { type: "string" },
          location: { type: "string" },
          about: { type: "string" },
          skills: { type: "array", items: { type: "string" } },
          education: { type: "array", items: { $ref: "#/components/schemas/EducationEntry" } },
          experience: { type: "array", items: { $ref: "#/components/schemas/ExperienceEntry" } },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CreateResume: {
        type: "object",
        required: ["fullName"],
        properties: {
          fullName: { type: "string", minLength: 1 },
          headline: { type: "string", default: "" },
          location: { type: "string", default: "" },
          about: { type: "string", default: "" },
          skills: { type: "array", items: { type: "string" }, default: [] },
          education: { type: "array", items: { $ref: "#/components/schemas/EducationEntry" }, default: [] },
          experience: { type: "array", items: { $ref: "#/components/schemas/ExperienceEntry" }, default: [] },
        },
      },
      EducationEntry: {
        type: "object",
        required: ["institution", "degree", "startYear"],
        properties: {
          institution: { type: "string" },
          degree: { type: "string" },
          field: { type: "string" },
          startYear: { type: "integer" },
          endYear: { type: "integer", nullable: true },
          description: { type: "string" },
        },
      },
      ExperienceEntry: {
        type: "object",
        required: ["company", "title", "startDate"],
        properties: {
          company: { type: "string" },
          title: { type: "string" },
          location: { type: "string" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time", nullable: true },
          current: { type: "boolean", default: false },
          description: { type: "string" },
        },
      },
      JobApplication: {
        type: "object",
        properties: {
          id: { type: "string" },
          job: { $ref: "#/components/schemas/Job" },
          resume: { $ref: "#/components/schemas/Resume" },
          coverLetter: { type: "string" },
          status: { type: "string", enum: ["applied", "reviewing", "interview", "offered", "rejected", "withdrawn"] },
          appliedAt: { type: "string", format: "date-time" },
        },
      },
      PaginatedJobs: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "object",
            properties: {
              jobs: { type: "array", items: { $ref: "#/components/schemas/Job" } },
            },
          },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              total: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
        },
      },
      PaginatedApplications: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "object",
            properties: {
              applications: { type: "array", items: { $ref: "#/components/schemas/JobApplication" } },
            },
          },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              total: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
        },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
}
