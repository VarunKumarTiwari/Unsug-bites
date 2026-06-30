import { ErrorPage } from "@/components/ui/error-page";

export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      title="This spot's gone quiet"
      description="The page you're looking for isn't here. Let's get you back to the good stuff."
    />
  );
}
