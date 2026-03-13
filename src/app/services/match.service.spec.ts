import { TestBed } from '@angular/core/testing';
import { MatchService } from './match.service';
import { Einsatzkraft, Position } from '../models/planung.model';

describe('MatchService', () => {
  let service: MatchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchService);
  });

  const makePosition = (taktisch: string | null, medizinisch: string | null): Position => ({
    id: '1',
    label: 'Test',
    requirements: { taktisch: taktisch as any, medizinisch: medizinisch as any },
    assigned: null,
  });

  const makePerson = (taktisch: string[], medizinisch: string[]): Einsatzkraft => ({
    id: '1',
    name: 'Test Person',
    tags: { taktisch: taktisch as any, medizinisch: medizinisch as any },
  });

  it('full match when all requirements met', () => {
    const pos = makePosition('GF', 'RS');
    const person = makePerson(['GF', 'ZF'], ['RS', 'RA']);
    expect(service.matchLevel(pos, person)).toBe('full');
  });

  it('partial match when only one requirement met', () => {
    const pos = makePosition('GF', 'RS');
    const person = makePerson(['GF'], []);
    expect(service.matchLevel(pos, person)).toBe('partial');
  });

  it('mismatch when no requirements met', () => {
    const pos = makePosition('GF', 'RS');
    const person = makePerson(['H'], ['EH']);
    expect(service.matchLevel(pos, person)).toBe('mismatch');
  });

  it('full match when no requirements set', () => {
    const pos = makePosition(null, null);
    const person = makePerson([], []);
    expect(service.matchLevel(pos, person)).toBe('full');
  });

  it('neutral when no einsatzkraft provided', () => {
    const pos = makePosition('GF', null);
    expect(service.positionMatchClass(pos, null)).toBe('neutral');
  });

  it('full match when person meets taktisch requirement with higher rank', () => {
    const pos = makePosition('GF', null);
    const person = makePerson(['ZF'], []);
    expect(service.matchLevel(pos, person)).toBe('full');
  });

  it('mismatch when person rank below requirement', () => {
    const pos = makePosition('GF', null);
    const person = makePerson(['H'], []);
    expect(service.matchLevel(pos, person)).toBe('mismatch');
  });

  it('person with empty tags against non-null requirement is mismatch', () => {
    const pos = makePosition('H', null);
    const person = makePerson([], []);
    expect(service.matchLevel(pos, person)).toBe('mismatch');
  });
});
