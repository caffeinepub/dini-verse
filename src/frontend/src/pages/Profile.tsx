import RequireProfile from '../components/auth/RequireProfile';
import { useGetCurrentUserProfile } from '../hooks/useUserProfile';
import { useGetExperiencesByAuthor } from '../hooks/useExperiences';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ProfileHeaderCard from '../components/profile/ProfileHeaderCard';
import ExperienceGrid from '../components/experiences/ExperienceGrid';

export default function Profile() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCurrentUserProfile();
  const { data: experiences, isLoading: experiencesLoading } = useGetExperiencesByAuthor(
    identity?.getPrincipal()
  );

  return (
    <RequireProfile>
      <div className="container py-8">
        <div className="space-y-8">
          <ProfileHeaderCard profile={userProfile} isLoading={profileLoading} />

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">My Experiences</h2>
              <p className="text-muted-foreground">
                {experiences?.length || 0} published experience{experiences?.length !== 1 ? 's' : ''}
              </p>
            </div>
            <ExperienceGrid
              experiences={experiences || []}
              isLoading={experiencesLoading}
              emptyMessage="You haven't published any experiences yet. Start creating!"
            />
          </div>
        </div>
      </div>
    </RequireProfile>
  );
}
