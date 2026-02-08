import { Link } from "react-router";
import { Box, Text, Badge } from "@chakra-ui/react";
import type { Job } from "@/api/types";

const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "تمام وقت",
  "part-time": "پاره وقت",
  contract: "قراردادی",
  internship: "کارآموزی",
  freelance: "دورکاری",
  remote: "دورکاری",
  hybrid: "ترکیبی",
};

type Props = { job: Job; showStatus?: boolean };

export function JobCard({ job, showStatus }: Props) {
  const types = job.type?.map((t) => JOB_TYPE_LABELS[t] ?? t).join("، ") ?? "";
  const statusLabel =
    job.status === "published"
      ? "فعال"
      : job.status === "draft"
        ? "پیش‌نویس"
        : "بسته";
  const statusColor =
    job.status === "published" ? "green" : job.status === "draft" ? "gray" : "red";

  const salaryText =
    job.showSalary && job.salaryMin != null
      ? `${job.salaryMin.toLocaleString("fa-IR")}${job.salaryMax != null ? ` - ${job.salaryMax.toLocaleString("fa-IR")}` : ""} ${job.salaryCurrency}`
      : null;

  return (
    <Link to={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
      <Box
        p="4"
        borderRadius="md"
        borderWidth="1px"
        borderColor="border"
        bg="bg.panel"
        transition="border-color 0.15s"
        _hover={{ borderColor: "border.emphasized" }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap="2" mb="3">
          <Text fontWeight="semibold" fontSize="lg" lineClamp={2} flex="1">
            {job.title}
          </Text>
          {showStatus && (
            <Badge colorPalette={statusColor} size="sm" flexShrink={0}>
              {statusLabel}
            </Badge>
          )}
        </Box>
        {(job.location || types) && (
          <Text fontSize="sm" color="fg.muted" mb="2" lineClamp={1}>
            {[job.location, types].filter(Boolean).join(" · ")}
          </Text>
        )}
        <Text fontSize="sm" lineClamp={2} color="fg.muted" mb="3">
          {job.description}
        </Text>
        {salaryText && (
          <Text fontSize="sm" color="brand.solid" fontWeight="medium" mb="2">
            {salaryText}
          </Text>
        )}
        {job.tags?.length ? (
          <Box display="flex" flexWrap="wrap" gap="1" mt="2">
            {job.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} size="sm" variant="subtle" colorPalette="gray">
                {tag}
              </Badge>
            ))}
          </Box>
        ) : null}
      </Box>
    </Link>
  );
}
