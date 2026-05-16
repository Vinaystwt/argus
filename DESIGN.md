# Argus Design System

## Visual Direction

Argus should feel like a security-grade command center and aircraft black-box replay system for autonomous financial agents.

## Scene

A treasury operator reviews agent risk on a large monitor during a high-stakes protocol operation. The room is dim, the data is sharp, and the interface treats rejected malicious actions as proof that the system is working.

## Theme

Dark operational UI with off-black graphite surfaces, surgical white text, amber proof highlights, green approvals, and red violation states. No pure black, no generic purple/blue AI gradients.

## Typography

- UI: Geist or system fallback.
- Proof data: Geist Mono or JetBrains Mono.
- Use tabular numbers and slashed zero where available.

## Component Rules

- Use shadcn-style primitives for accessibility, not default visuals.
- Avoid nested cards.
- Use proof panels, timelines, split command layouts, and dense but readable forensic views.
- Hashes, roots, addresses, and tx IDs are visually prominent.

## Motion Rules

- Motion explains proof flow.
- User-triggered UI stays under 300ms.
- Use Framer Motion for in-app staged proof sequences.
- Use GSAP only in isolated cinematic sections if needed.
- Respect reduced motion.
