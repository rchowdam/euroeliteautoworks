import { useState } from "react";

// A YouTube video in the gallery: the thumbnail with a play button, and the real player
// (youtube-nocookie, no tracking until played) only once it is clicked, so the page stays fast.
export default function YouTube({ id, title }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="yt"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title || "YouTube video"}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  }
  return (
    <button type="button" className="yt" onClick={() => setPlaying(true)} aria-label={`Play video${title ? `: ${title}` : ""}`}>
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
      <span className="yt__play" aria-hidden="true" />
    </button>
  );
}
