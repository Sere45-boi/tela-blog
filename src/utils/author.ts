/**
 * Utility to consistently handle author attribution based on profile visibility.
 */
export function getAuthorAttribution(profile: any) {
  if (!profile || profile.is_public === false) {
    return {
      name: "Tela",
      avatar_url: "/images/logo.PNG",
      bio: "The borderless financial OS for ambitious businesses in emerging markets. Built for global scale.",
    };
  }

  return {
    name: profile.full_name || "Tela",
    avatar_url: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'T')}&background=e8f5e8&color=093C15&size=96&bold=true`,
    bio: profile.bio || "",
  };
}
