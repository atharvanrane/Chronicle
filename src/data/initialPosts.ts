import { Post } from '../types/blog';

/**
 * Clean initial catalog: starts empty so user and admin have zero garbage data.
 * Real posts are created and persisted by authenticated creators.
 */
export const INITIAL_POSTS: Post[] = [];
