import { Request, Response } from 'express';
import prisma from '../config/database';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

// Pick localized fields based on ?lang query param
function localize(ev: any, lang: string | undefined) {
  const isEs = (lang || '').startsWith('es');
  return {
    id: ev.id,
    slug: ev.slug,
    title: isEs && ev.titleEs ? ev.titleEs : ev.title,
    excerpt: isEs && ev.excerptEs ? ev.excerptEs : ev.excerpt,
    body: isEs && ev.bodyEs ? ev.bodyEs : ev.body,
    imageUrl: ev.imageUrl,
    isPromotion: ev.isPromotion,
    isPublished: ev.isPublished,
    publishedAt: ev.publishedAt,
  };
}

// --- Public ---
export const listEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    });
    res.json(events.map(ev => localize(ev, req.query.lang as string)));
  } catch (error) {
    console.error('List events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const ev = await prisma.event.findUnique({ where: { slug: req.params.slug as string } });
    if (!ev || !ev.isPublished) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.json(localize(ev, req.query.lang as string));
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// --- Admin ---
export const adminListEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const events = await prisma.event.findMany({ orderBy: { publishedAt: 'desc' } });
    res.json(events);
  } catch (error) {
    console.error('Admin list events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const adminCreateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, titleEs, excerpt, excerptEs, body, bodyEs, imageUrl, isPromotion, isPublished, publishedAt, slug } = req.body;
    if (!title || !body) {
      res.status(400).json({ error: 'Title and body are required' });
      return;
    }
    let finalSlug = (slug && slugify(slug)) || slugify(title);
    // Ensure uniqueness
    let suffix = 0;
    while (await prisma.event.findUnique({ where: { slug: suffix ? `${finalSlug}-${suffix}` : finalSlug } })) {
      suffix++;
    }
    if (suffix) finalSlug = `${finalSlug}-${suffix}`;

    const ev = await prisma.event.create({
      data: {
        slug: finalSlug,
        title,
        titleEs: titleEs || null,
        excerpt: excerpt || null,
        excerptEs: excerptEs || null,
        body,
        bodyEs: bodyEs || null,
        imageUrl: imageUrl || null,
        isPromotion: !!isPromotion,
        isPublished: isPublished === undefined ? true : !!isPublished,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
    });
    res.status(201).json(ev);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const adminUpdateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: any = {};
    const fields = ['title', 'titleEs', 'excerpt', 'excerptEs', 'body', 'bodyEs', 'imageUrl', 'isPromotion', 'isPublished'];
    for (const f of fields) {
      if (f in req.body) data[f] = req.body[f];
    }
    if (req.body.publishedAt) data.publishedAt = new Date(req.body.publishedAt);
    if (req.body.slug) data.slug = slugify(req.body.slug);

    const ev = await prisma.event.update({
      where: { id: req.params.id as string },
      data,
    });
    res.json(ev);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'An event with that slug already exists' });
      return;
    }
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const adminDeleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.event.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Event deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};
