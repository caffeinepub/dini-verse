import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Category } from "../backend";
import ExperienceGrid from "../components/experiences/ExperienceGrid";
import PublishExperienceDialog from "../components/experiences/PublishExperienceDialog";
import { useCurrentUser } from "../hooks/useCurrentUser";
import {
  useGetExperiencesByCategory,
  useGetTrendingExperiences,
  useSearchExperiences,
} from "../hooks/useExperiences";
import { useTranslation } from "../hooks/useTranslation";

export default function Discover() {
  const [searchTerm, setSearchTerm] = useState("");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    Category.adventure,
  );
  const { isAuthenticated } = useCurrentUser();
  const { t } = useTranslation();

  const { data: searchResults, isLoading: searchLoading } =
    useSearchExperiences(searchTerm);
  const { data: categoryExperiences, isLoading: categoryLoading } =
    useGetExperiencesByCategory(selectedCategory);
  const { data: trendingExperiences, isLoading: trendingLoading } =
    useGetTrendingExperiences(selectedCategory);

  const displayExperiences = searchTerm ? searchResults : categoryExperiences;
  const displayLoading = searchTerm ? searchLoading : categoryLoading;

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {t("discover.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("discover.subtitle")}
            </p>
          </div>
          {isAuthenticated && (
            <Button
              onClick={() => setPublishDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("discover.publish")}
            </Button>
          )}
        </div>

        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("discover.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {!searchTerm && (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">
                  {t("discover.trending")}
                </h2>
              </div>
              <Tabs
                value={selectedCategory}
                onValueChange={(value) =>
                  setSelectedCategory(value as Category)
                }
              >
                <TabsList>
                  <TabsTrigger value={Category.adventure}>
                    {t("discover.categories.adventure")}
                  </TabsTrigger>
                  <TabsTrigger value={Category.roleplay}>
                    {t("discover.categories.roleplay")}
                  </TabsTrigger>
                  <TabsTrigger value={Category.simulator}>
                    {t("discover.categories.simulator")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={selectedCategory} className="mt-6">
                  <ExperienceGrid
                    experiences={trendingExperiences || []}
                    isLoading={trendingLoading}
                    emptyMessage={t("discover.noTrending")}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">
                {t("discover.allExperiences")}
              </h2>
              <ExperienceGrid
                experiences={displayExperiences || []}
                isLoading={displayLoading}
              />
            </div>
          </>
        )}

        {searchTerm && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {t("discover.searchResults")}
            </h2>
            <ExperienceGrid
              experiences={displayExperiences || []}
              isLoading={displayLoading}
              emptyMessage={t("discover.noResults")}
            />
          </div>
        )}
      </div>

      <PublishExperienceDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
      />
    </div>
  );
}
