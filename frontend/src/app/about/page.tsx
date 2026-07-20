import { ArtistCard } from "@/components/artist-card";
import { serverFetch } from "@/lib/server-api";
import type { Artist } from "@/lib/types";

export default async function AboutPage() {
  const artists = await serverFetch<Artist[]>("/api/artists/?house_band=true");

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <p className="text-sm uppercase tracking-[0.3em] text-primary">About</p>
      <h1 className="mt-2 text-4xl">Jazz91</h1>

      <div className="mt-6 space-y-4 text-lg text-muted-foreground">
        <p>
          We are a group of friends and music enthusiasts passionate about
          creating vibrant, community-driven experiences through live music.
        </p>
        <p>
          Jazz91 was born out of a shared love for Afrocentric jazz, fusion,
          and soulful expression, and a desire to build a space where people
          can connect, unwind, and be inspired.
        </p>
        <p>
          Every last Sunday of the month, we gather to celebrate music that
          uplifts the spirit and strengthens the community — one note, one
          story, and one moment at a time.
        </p>
        <p>
          What began as a simple idea among friends to host an intimate
          evening of music and conversation has grown into a gathering that
          celebrates the spirit of jazz and the heart of community.
        </p>
        <p>
          Jazz91 is more than an event — it&apos;s a live music experience
          that moves where the rhythm leads. We&apos;re creating spaces,
          wherever they may be, where music, spirit, and community come
          together in harmony.
        </p>
        <p>
          Our vision is to build a traveling circle of connection and
          creativity, bringing Afrocentric jazz, fusion, and soulful
          expression to different places, while nurturing a loyal community
          that grows with every gathering.
        </p>
        <p className="text-foreground">
          No fixed walls, no boundaries — just sound, light, and the people
          who make it come alive.
        </p>
      </div>

      {artists && artists.length > 0 && (
        <div className="mt-16">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">The Team</p>
          <h2 className="mt-2 text-2xl">Meet the Band</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
