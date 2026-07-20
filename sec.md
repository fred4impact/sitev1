# The Songroom Sessions

## Master Product Specification (spec.md)

> Version: 1.0 Status: Living Document

# 1. Vision

The Songroom Sessions is a standalone platform that connects audiences
with intimate live music experiences centered around storytelling,
original songs, and authentic performances.

The platform is designed to grow from a single recurring event into a
recognised music brand.

------------------------------------------------------------------------

# 2. Mission

Create spaces where songs are heard before they become records.

------------------------------------------------------------------------

# 3. Core Values

-   Intimacy
-   Authenticity
-   Community
-   Creativity
-   Accessibility
-   Simplicity
-   Quality

------------------------------------------------------------------------

# 4. Brand Identity

## Name

The Songroom Sessions

## Tagline Ideas

-   Stories. Songs. First Listens.
-   Music in its Most Honest Form.
-   Where Stories Become Songs.
-   An Intimate Listening Experience.

------------------------------------------------------------------------

# 5. Target Audience

Primary: - Live music lovers - Jazz & acoustic audiences - Independent
music supporters - Professionals seeking premium cultural experiences

Secondary: - Songwriters - Emerging artists - Creative communities

------------------------------------------------------------------------

# 6. Information Architecture

Public - Home - About - Events - Stories - Song Vault - Gallery -
Membership - Contact

Member Area - Dashboard - Upcoming Events - Tickets - Song Vault - Saved
Songs - Profile - Notifications

Admin - Dashboard - Events - Venues - Songs - Stories - Members -
Analytics - Ticket Scanner - Settings

------------------------------------------------------------------------

# 7. Functional Requirements

## Event Management

-   Create/Edit events
-   Capacity management
-   Waitlists
-   QR ticketing
-   Seating (optional)
-   Event archive

## Song Vault

Each song includes: - Story - Lyrics - Demo - Live recording - Studio
release - Images - Comments - Favourite count

## Membership (The Songroom Circle)

-   Authentication
-   Early booking
-   Exclusive content
-   Member profile
-   Subscription management

## Community

-   Comments
-   Likes
-   Song requests
-   Event feedback

## CMS

-   Publish stories
-   Upload galleries
-   Schedule content

------------------------------------------------------------------------

# 8. Technical Architecture

Frontend - Next.js - React - TypeScript - Tailwind CSS - shadcn/ui -
Framer Motion

Backend - Supabase - PostgreSQL - Edge Functions

Storage - Cloudinary

Payments - Stripe

Deployment - Vercel

Emails - Resend

------------------------------------------------------------------------

# 9. Suggested Database

Users Artists Events Venues Tickets Orders Songs Stories Memberships
Media Comments Likes Notifications

------------------------------------------------------------------------

# 10. Security

-   HTTPS
-   Row Level Security
-   MFA for admins
-   Secure payment handling
-   GDPR compliance

------------------------------------------------------------------------

# 11. User Roles

Guest Member Artist Host Administrator

------------------------------------------------------------------------

# 12. User Journeys

Guest Visit → Browse → Book → Attend → Join Membership

Member Login → Discover → Listen → Comment → Book Early

Admin Login → Create Event → Publish → Monitor Sales → Check-in Guests →
Archive

------------------------------------------------------------------------

# 13. Design System

Theme - Dark-first - Warm gold accents - Black - Charcoal - Ivory

Typography - Elegant serif headings - Modern sans body

Components - Cards - Event tiles - Song cards - Story cards - Gallery -
Ticket widget - Membership banner

------------------------------------------------------------------------

# 14. Non-functional Requirements

-   Mobile-first
-   Responsive
-   WCAG AA
-   Fast (\<2s load)
-   SEO friendly
-   Server-side rendering
-   Image optimisation

------------------------------------------------------------------------

# 15. Roadmap

Phase 1 Website Events Ticketing

Phase 2 Membership Song Vault Community

Phase 3 Livestreams Podcast Guest artists

Phase 4 Multiple cities Mobile apps API Partner programme

------------------------------------------------------------------------

# 16. Success Metrics

-   Sold-out events
-   Returning attendees
-   Membership growth
-   Song engagement
-   Newsletter sign-ups
-   Revenue
-   Community activity

------------------------------------------------------------------------

# 17. Long-Term Vision

The Songroom Sessions becomes a destination where audiences discover
artists through intimate performances and storytelling, while artists
gain a trusted platform to share new work before wider release.

The platform should evolve into a sustainable ecosystem supporting live
events, digital experiences, memberships, media, and creative
collaboration.


ideas
---------------------
The next step I'd suggest is creating a much more comprehensive specification (closer to an engineering handbook than a simple README). It would include:

Brand Bible (mission, values, tone of voice, logo usage, colours, typography)
Design System (components, spacing, icons, animations, accessibility)
Complete UI Wireframes for every page
Database Schema with every table, relationship, and field
API Specification for frontend/backend interactions
Authentication & Permissions Matrix
Ticketing & QR Check-in Workflow
Membership & Subscription Model
Admin Portal (event management, content, users, analytics)
Email & Notification Flows
SEO & Content Strategy
Deployment & DevOps (GitHub, Vercel, environments, backups)
Monitoring & Analytics
Testing Strategy
Scalability Roadmap from launch to tens of thousands of users


Backend

Django

User management
Authentication
Admin portal
Business logic
Permissions
Email handling
Background tasks

Django REST Framework (DRF)

REST APIs for the React frontend
Mobile app support in the future
Third-party integrations

PostgreSQL

Excellent with Django
Reliable
Scales well

Redis + Celery

Email queues
Scheduled reminders
Background processing
Ticket generation
Frontend

React

Fast, interactive UI
Component-based
Easy to expand

I'd actually recommend Next.js rather than plain React because it gives you:

Better SEO (important for event discovery)
Faster page loads
Image optimization
Server-side rendering
Easier deployment

Since Next.js is built on React, you're still wr

flows 
------------------
Admin

Dashboard

Events

Songs

Stories

Members

Venues

Artists

Bookings

Payments

Emails

Gallery

Analytics

API STRUCTURE 
--------------------
/api/

auth/

events/

songs/

stories/

members/

tickets/

venues/

gallery/

comments/

notifications/

dashboard/


REACT STRUCTURE 
-----------------------------
src/

components/

pages/

hooks/

services/

contexts/

layouts/

features/

events/

songs/

stories/

members/

admin/

----
Authentication

Use:

JWT tokens
Refresh tokens
Role-based permissions

Roles:

Guest

Member

Artist

Host

Administrator
Admin Experience

Django Admin already provides:

Search
Filters
Bulk actions
CSV export
Permissions
History tracking
Inline editing

You'd be surprised how much you can do before needing a custom admin dashboard.

how 
-----
                 React / Next.js Website
                          │
                    Django REST API
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
React Admin Portal (future)        Django Admin + Unfold
        │                                   │
        └────────────── PostgreSQL ─────────┘