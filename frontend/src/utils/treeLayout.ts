/**
 * Algorithme de layout d'arbre généalogique - partagé entre web et Android
 */

export interface Person {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date?: string;
  is_preview?: boolean;
}

export interface FamilyLink {
  id: string;
  person_id_1: string;
  person_id_2: string;
  link_type: string;
}

export const NODE_WIDTH = 130;
export const NODE_HEIGHT = 65;
export const LEVEL_HEIGHT = 140;
export const NODE_SPACING = 30;
export const COUPLE_SPACING = 15;

const parseBirthDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return null;
};

// Normaliser les liens (API peut retourner person_id_1/2 ou person_1/2)
function normalizeLink(link: any): { person_id_1: string; person_id_2: string; link_type: string } | null {
  const p1 = link.person_id_1 ?? link.person_1 ?? link.personId1;
  const p2 = link.person_id_2 ?? link.person_2 ?? link.personId2;
  const type = link.link_type ?? link.type;
  if (p1 && p2 && type) return { person_id_1: String(p1), person_id_2: String(p2), link_type: String(type) };
  return null;
}

export function buildTreeLayout(
  persons: Person[],
  links: FamilyLink[] | any[]
): { nodes: { person: Person; x: number; y: number }[]; connections: { from: { x: number; y: number }; to: { x: number; y: number }; type: string }[] } {
  if (persons.length === 0) return { nodes: [], connections: [] };

  // Normaliser les persons (id peut être id ou _id)
  const normalizedPersons = persons.map(p => ({
    ...p,
    id: String((p as any).id ?? (p as any)._id ?? ''),
  })).filter(p => p.id);

  const childToParents = new Map<string, Set<string>>();
  const parentToChildren = new Map<string, Set<string>>();
  const spouseMap = new Map<string, Set<string>>();
  const personById = new Map<string, Person>();
  normalizedPersons.forEach(p => personById.set(p.id, p));

  const normalizedLinks = (links || []).map((l: any) => normalizeLink(l)).filter(Boolean) as { person_id_1: string; person_id_2: string; link_type: string }[];

  normalizedLinks.forEach(link => {
    if (link.link_type === 'parent') {
      const parentId = link.person_id_1;
      const childId = link.person_id_2;
      if (!childToParents.has(childId)) childToParents.set(childId, new Set());
      childToParents.get(childId)!.add(parentId);
      if (!parentToChildren.has(parentId)) parentToChildren.set(parentId, new Set());
      parentToChildren.get(parentId)!.add(childId);
    } else if (link.link_type === 'spouse') {
      if (!spouseMap.has(link.person_id_1)) spouseMap.set(link.person_id_1, new Set());
      if (!spouseMap.has(link.person_id_2)) spouseMap.set(link.person_id_2, new Set());
      spouseMap.get(link.person_id_1)!.add(link.person_id_2);
      spouseMap.get(link.person_id_2)!.add(link.person_id_1);
    }
  });

  const personLevels = new Map<string, number>();
  const roots: string[] = [];
  normalizedPersons.forEach(p => {
    if (!childToParents.has(p.id) || childToParents.get(p.id)!.size === 0) {
      roots.push(p.id);
    }
  });

  const queue: { id: string; level: number }[] = roots.map(id => ({ id, level: 0 }));
  const visited = new Set<string>();
  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    if (visited.has(id)) {
      if (level > (personLevels.get(id) || 0)) personLevels.set(id, level);
      continue;
    }
    visited.add(id);
    personLevels.set(id, level);
    const children = parentToChildren.get(id);
    if (children) children.forEach(childId => queue.push({ id: childId, level: level + 1 }));
  }
  normalizedPersons.forEach(p => {
    if (!personLevels.has(p.id)) personLevels.set(p.id, 0);
  });

  let changed = true;
  let iterations = 0;
  while (changed && iterations < 50) {
    changed = false;
    iterations++;
    spouseMap.forEach((spouses, personId) => {
      const personLevel = personLevels.get(personId)!;
      spouses.forEach(spouseId => {
        const spouseLevel = personLevels.get(spouseId)!;
        if (personLevel !== spouseLevel) {
          const targetLevel = Math.max(personLevel, spouseLevel);
          personLevels.set(personId, targetLevel);
          personLevels.set(spouseId, targetLevel);
          changed = true;
        }
      });
    });
      if (changed) {
        normalizedPersons.forEach(p => {
        const parents = childToParents.get(p.id);
        if (parents && parents.size > 0) {
          let maxParentLevel = -1;
          parents.forEach(parentId => {
            maxParentLevel = Math.max(maxParentLevel, personLevels.get(parentId) || 0);
          });
          const newLevel = maxParentLevel + 1;
          if ((personLevels.get(p.id) || 0) < newLevel) {
            personLevels.set(p.id, newLevel);
          }
        }
      });
    }
  }

  parentToChildren.forEach((childrenSet, parentId) => {
    const sorted = [...childrenSet].sort((aId, bId) => {
      const dateA = parseBirthDate(personById.get(aId)?.birth_date);
      const dateB = parseBirthDate(personById.get(bId)?.birth_date);
      if (dateA && dateB) return dateA.getTime() - dateB.getTime();
      if (dateA && !dateB) return -1;
      if (!dateA && dateB) return 1;
      return 0;
    });
    parentToChildren.set(parentId, new Set(sorted));
  });

  const levelGroups = new Map<number, Person[]>();
  normalizedPersons.forEach(p => {
    const level = personLevels.get(p.id) || 0;
    if (!levelGroups.has(level)) levelGroups.set(level, []);
    levelGroups.get(level)!.push(p);
  });

  levelGroups.forEach((personsAtLevel) => {
    personsAtLevel.sort((a, b) => {
      const dateA = parseBirthDate(a.birth_date);
      const dateB = parseBirthDate(b.birth_date);
      if (dateA && dateB) return dateA.getTime() - dateB.getTime();
      if (dateA && !dateB) return -1;
      if (!dateA && dateB) return 1;
      return 0;
    });
  });

  const subtreeWidths = new Map<string, number>();
  const processedForWidth = new Set<string>();
  const calculateSubtreeWidth = (personId: string): number => {
    if (subtreeWidths.has(personId)) return subtreeWidths.get(personId)!;
    if (processedForWidth.has(personId)) return NODE_WIDTH;
    processedForWidth.add(personId);
    const person = personById.get(personId);
    if (!person) return NODE_WIDTH;
    const personLevel = personLevels.get(personId) || 0;
    const spouses = spouseMap.get(personId);
    let unitMembers = [personId];
    if (spouses) {
      spouses.forEach(sId => {
        if ((personLevels.get(sId) || 0) === personLevel && !unitMembers.includes(sId)) {
          unitMembers.push(sId);
        }
      });
    }
    const ownWidth = unitMembers.length * NODE_WIDTH + (unitMembers.length - 1) * COUPLE_SPACING;
    const allChildren = new Set<string>();
    unitMembers.forEach(memberId => {
      const children = parentToChildren.get(memberId);
      if (children) children.forEach(cId => allChildren.add(cId));
    });
    if (allChildren.size === 0) {
      subtreeWidths.set(personId, ownWidth);
      return ownWidth;
    }
    const childrenArray = [...allChildren].sort((aId, bId) => {
      const a = personById.get(aId);
      const b = personById.get(bId);
      const dateA = a?.birth_date ? new Date(a.birth_date).getTime() : Infinity;
      const dateB = b?.birth_date ? new Date(b.birth_date).getTime() : Infinity;
      return dateA - dateB;
    });
    let totalChildrenWidth = 0;
    const processedChildren = new Set<string>();
    let childUnitCount = 0;
    childrenArray.forEach(childId => {
      if (processedChildren.has(childId)) return;
      totalChildrenWidth += calculateSubtreeWidth(childId);
      childUnitCount++;
      processedChildren.add(childId);
      spouseMap.get(childId)?.forEach(csId => processedChildren.add(csId));
    });
    if (childUnitCount > 1) totalChildrenWidth += (childUnitCount - 1) * NODE_SPACING;
    const subtreeWidth = Math.max(ownWidth, totalChildrenWidth);
    subtreeWidths.set(personId, subtreeWidth);
    unitMembers.forEach(memberId => subtreeWidths.set(memberId, subtreeWidth));
    return subtreeWidth;
  };

  normalizedPersons.forEach(p => {
    const parents = childToParents.get(p.id);
    if (!parents || parents.size === 0) calculateSubtreeWidth(p.id);
  });
  normalizedPersons.forEach(p => calculateSubtreeWidth(p.id));

  const personPositions = new Map<string, { x: number; y: number }>();
  const positionedPersons = new Set<string>();

  const positionSubtree = (personId: string, startX: number, level: number) => {
    if (positionedPersons.has(personId)) return;
    const person = personById.get(personId);
    if (!person) return;
    const y = level * LEVEL_HEIGHT + 80;
    const personLevel = personLevels.get(personId) || 0;
    const spouses = spouseMap.get(personId);
    let unitMembers = [person];
    if (spouses) {
      spouses.forEach(sId => {
        const spouse = personById.get(sId);
        if (spouse && (personLevels.get(sId) || 0) === personLevel && !positionedPersons.has(sId)) {
          unitMembers.push(spouse);
        }
      });
    }
    const subtreeWidth = subtreeWidths.get(personId) || NODE_WIDTH;
    const unitWidth = unitMembers.length * NODE_WIDTH + (unitMembers.length - 1) * COUPLE_SPACING;
    const unitStartX = startX + (subtreeWidth - unitWidth) / 2;
    let x = unitStartX;
    unitMembers.forEach(member => {
      personPositions.set(member.id, { x, y });
      positionedPersons.add(member.id);
      x += NODE_WIDTH + COUPLE_SPACING;
    });
    const allChildren = new Set<string>();
    unitMembers.forEach(member => {
      const children = parentToChildren.get(member.id);
      if (children) children.forEach(cId => allChildren.add(cId));
    });
    if (allChildren.size === 0) return;
    const childrenArray = [...allChildren].sort((aId, bId) => {
      const a = personById.get(aId);
      const b = personById.get(bId);
      const dateA = a?.birth_date ? new Date(a.birth_date).getTime() : Infinity;
      const dateB = b?.birth_date ? new Date(b.birth_date).getTime() : Infinity;
      return dateA - dateB;
    });
    let childX = startX;
    const processedChildren = new Set<string>();
    childrenArray.forEach(childId => {
      if (processedChildren.has(childId)) return;
      const childSubtreeWidth = subtreeWidths.get(childId) || NODE_WIDTH;
      const childLevel = personLevels.get(childId) || (level + 1);
      positionSubtree(childId, childX, childLevel);
      processedChildren.add(childId);
      spouseMap.get(childId)?.forEach(csId => processedChildren.add(csId));
      childX += childSubtreeWidth + NODE_SPACING;
    });
  };

  const rootPersons = normalizedPersons.filter(p => {
    const parents = childToParents.get(p.id);
    return !parents || parents.size === 0;
  });
  rootPersons.sort((a, b) => {
    const levelA = personLevels.get(a.id) || 0;
    const levelB = personLevels.get(b.id) || 0;
    if (levelA !== levelB) return levelA - levelB;
    const dateA = a.birth_date ? new Date(a.birth_date).getTime() : Infinity;
    const dateB = b.birth_date ? new Date(b.birth_date).getTime() : Infinity;
    return dateA - dateB;
  });

  const rootsByLevel = new Map<number, Person[]>();
  rootPersons.forEach(p => {
    const level = personLevels.get(p.id) || 0;
    if (!rootsByLevel.has(level)) rootsByLevel.set(level, []);
    rootsByLevel.get(level)!.push(p);
  });

  let currentX = 50;
  const processedRoots = new Set<string>();
  const sortedRootLevels = [...rootsByLevel.keys()].sort((a, b) => a - b);
  sortedRootLevels.forEach(level => {
    const rootsAtLevel = rootsByLevel.get(level) || [];
    rootsAtLevel.forEach(root => {
      if (processedRoots.has(root.id)) return;
      spouseMap.get(root.id)?.forEach(sId => processedRoots.add(sId));
      processedRoots.add(root.id);
      const subtreeWidth = subtreeWidths.get(root.id) || NODE_WIDTH;
      positionSubtree(root.id, currentX, level);
      currentX += subtreeWidth + NODE_SPACING * 2;
    });
  });

  normalizedPersons.forEach(person => {
    if (!positionedPersons.has(person.id)) {
      const level = personLevels.get(person.id) || 0;
      const y = level * LEVEL_HEIGHT + 80;
      personPositions.set(person.id, { x: currentX, y });
      positionedPersons.add(person.id);
      currentX += NODE_WIDTH + NODE_SPACING;
    }
  });

  const nodes: { person: Person; x: number; y: number }[] = [];
  normalizedPersons.forEach(person => {
    const pos = personPositions.get(person.id);
    if (pos) nodes.push({ person, x: pos.x, y: pos.y });
  });

  const connections: { from: { x: number; y: number }; to: { x: number; y: number }; type: string }[] = [];
  const drawnSpouseConnections = new Set<string>();
  spouseMap.forEach((spouses, personId) => {
    spouses.forEach(spouseId => {
      const key = [personId, spouseId].sort().join('-');
      if (drawnSpouseConnections.has(key)) return;
      drawnSpouseConnections.add(key);
      const pos1 = personPositions.get(personId);
      const pos2 = personPositions.get(spouseId);
      if (pos1 && pos2) {
        const leftPos = pos1.x < pos2.x ? pos1 : pos2;
        const rightPos = pos1.x < pos2.x ? pos2 : pos1;
        connections.push({
          from: { x: leftPos.x + NODE_WIDTH, y: leftPos.y + NODE_HEIGHT / 2 },
          to: { x: rightPos.x, y: rightPos.y + NODE_HEIGHT / 2 },
          type: 'spouse',
        });
      }
    });
  });

  const drawnParentChildLines = new Set<string>();
  const drawnSiblingConnections = new Set<string>();
  normalizedLinks.forEach(link => {
    if (link.link_type === 'parent') {
      const parentId = link.person_id_1;
      const childId = link.person_id_2;
      const lineKey = `${parentId}->${childId}`;
      if (drawnParentChildLines.has(lineKey)) return;
      drawnParentChildLines.add(lineKey);
      const parentPos = personPositions.get(parentId);
      const childPos = personPositions.get(childId);
      if (!parentPos || !childPos) return;
      let fromX = parentPos.x + NODE_WIDTH / 2;
      const otherParents = childToParents.get(childId);
      if (otherParents && otherParents.size > 1) {
        const mySpouses = spouseMap.get(parentId) || new Set();
        otherParents.forEach(otherParentId => {
          if (otherParentId !== parentId && mySpouses.has(otherParentId)) {
            const otherParentPos = personPositions.get(otherParentId);
            if (otherParentPos && Math.abs(otherParentPos.y - parentPos.y) < 10) {
              const minX = Math.min(parentPos.x, otherParentPos.x);
              const maxX = Math.max(parentPos.x, otherParentPos.x) + NODE_WIDTH;
              fromX = (minX + maxX) / 2;
              drawnParentChildLines.add(`${otherParentId}->${childId}`);
            }
          }
        });
      }
      connections.push({
        from: { x: fromX, y: parentPos.y + NODE_HEIGHT },
        to: { x: childPos.x + NODE_WIDTH / 2, y: childPos.y },
        type: 'parent',
      });
    } else if (link.link_type === 'sibling') {
      const pos1 = personPositions.get(link.person_id_1);
      const pos2 = personPositions.get(link.person_id_2);
      if (pos1 && pos2) {
        const key = [link.person_id_1, link.person_id_2].sort().join('-');
        if (!drawnSiblingConnections.has(key)) {
          drawnSiblingConnections.add(key);
          const leftPos = pos1.x < pos2.x ? pos1 : pos2;
          const rightPos = pos1.x < pos2.x ? pos2 : pos1;
          connections.push({
            from: { x: leftPos.x + NODE_WIDTH, y: leftPos.y + NODE_HEIGHT / 2 },
            to: { x: rightPos.x, y: rightPos.y + NODE_HEIGHT / 2 },
            type: 'sibling',
          });
        }
      }
    }
  });

  // FALLBACK : si l'algo n'a pas positionné tous les membres, utiliser une grille
  if (nodes.length < normalizedPersons.length) {
    const cols = Math.ceil(Math.sqrt(normalizedPersons.length));
    const gridNodes = normalizedPersons.map((person, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        person,
        x: 20 + col * (NODE_WIDTH + NODE_SPACING),
        y: 20 + row * (NODE_HEIGHT + NODE_SPACING),
      };
    });
    return { nodes: gridNodes, connections: [] };
  }

  return { nodes, connections };
}
