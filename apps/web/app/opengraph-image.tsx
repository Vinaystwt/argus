import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'Argus — Cryptographic mandate enforcement for AI agents';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          background: '#0A0A0B',
          padding: '80px 100px',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* Top rule */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: '#D4A853',
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#D4A853',
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#6B6B6B',
            }}
          >
            Protocol · 0G Mainnet
          </span>
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: '#F0F0F0',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            marginBottom: 28,
          }}
        >
          Argus
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: '#8A8A8A',
            lineHeight: 1.4,
            maxWidth: 700,
            marginBottom: 64,
          }}
        >
          Cryptographic mandate enforcement for autonomous AI agents.
        </div>

        {/* Horizontal rule */}
        <div
          style={{
            width: 64,
            height: 1,
            background: '#2A2A2B',
            marginBottom: 32,
          }}
        />

        {/* Bottom tag */}
        <div
          style={{
            fontSize: 14,
            color: '#4A4A4B',
            letterSpacing: '0.04em',
          }}
        >
          Deployed on 0G Mainnet · chainscan.0g.ai · useargus.xyz
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
