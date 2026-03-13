import { describe, it, expect } from 'vitest';
import filmsData from '../data/films_stats.json';

describe('Find films without Description', () => {
  it('should list films missing Description', () => {
    const movies = (filmsData as any).Movies_Info;
    const missing = movies
      .filter((m: any) => !m.Description || m.Description === '')
      .map((m: any) => ({
        id: m.id,
        title: m.Film_title,
        year: m.Release_year,
        url: m.Film_URL
      }));
    
    console.log('Total movies:', movies.length);
    console.log('Missing Description count:', missing.length);
    console.log('Missing films:', JSON.stringify(missing, null, 2));
    
    // This test is just for output purposes
    expect(true).toBe(true);
  });
});
