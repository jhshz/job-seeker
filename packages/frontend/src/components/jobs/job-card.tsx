import { Link } from "react-router";
import { Box, Text } from "@chakra-ui/react";
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

type Props = { job: Job };

export function JobCard({ job }: Props) {
  const types = job.type?.map((t) => JOB_TYPE_LABELS[t] ?? t).join("، ") ?? "";

  return (
    <Link to={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
      <Box
        p="4"
        borderRadius="md"
        borderWidth="1px"
        _hover={{ borderColor: "blue.400" }}
        transition="border-color 0.2s"
      >
        <Text fontWeight="bold" fontSize="lg" mb="2">
          {job.title}
        </Text>
        {(job.location || types) && (
          <Text fontSize="sm" color="fg.muted" mb="2">
            {[job.location, types].filter(Boolean).join(" · ")}
          </Text>
        )}
        <Text fontSize="sm" lineClamp={2} color="fg.muted">
          {job.description}
        </Text>
      {job.tags?.length ? (
        <Text fontSize="xs" color="fg.muted" mt="2">
          {job.tags.slice(0, 3).join("، ")}
        </Text>
      ) : null}
      </Box>
    </Link>
  );
}
