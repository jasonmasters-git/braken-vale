// Five Leagues from the Borderlands, third edition v2, pp. 59–66.
// Keep names stable so existing equipment strings continue to resolve.
const itemCatalog = [];
function catalogItem(name, slots, stats, properties, description) {
  itemCatalog.push({name, slots, stats, properties, description});
}

const melee = ['Main hand', 'Off hand'];
const ranged = ['Ranged'];
const weapons = [
  ['Unarmed', melee, '−1 / −1', '', 'Improvised attacks'],
  ['Light Weapon', melee, '−1 / +0', '', 'Basic weapon'],
  ['Staff', melee, '−1 / +0', '', 'Basic weapon · Parry'],
  ['Standard Weapon', melee, '+0 / +0', '', 'Basic weapon'],
  ['Self Bow', ranged, '+0 / +0', '18″', 'Basic weapon · Bulky · Limited Ammunition'],
  ['Sling', ranged, '−1 / +0', '10″', 'Basic weapon · Unlimited Ammunition'],
  ['Bastard Sword', melee, '+0 / +1', '', 'Quality weapon'],
  ['Warhammer', melee, '+1 / +0', '', 'Quality weapon'],
  ['War Spear', melee, '+0 / +0', '', 'Quality weapon · Always eligible to Counter Attack'],
  ['Fencing Sword', melee, '+0 / +0', '', 'Quality weapon · Parry'],
  ['Longbow', ranged, '+0 / +0', '24″', 'Quality weapon · Bulky · Limited Ammunition'],
  ['Crossbow', ranged, '+1 / +0', '24″', 'Quality weapon · Bulky · Limited Ammunition · Stationary to shoot'],
  ['Throwing Knives', ranged, '−1 / +0', '9″', 'Quality weapon · One use · Recovered if you Hold the Field · Combat Skill applies after moving'],
];
for (const [name, slots, damage, range, properties] of weapons) {
  const stats = 'Overcome Armor / Toughness ' + damage + (range ? ' · Range ' + range : '');
  const description = range ? 'A weapon for ranged attacks.' : 'A weapon profile for melee exchanges.';
  catalogItem(name, slots, stats, properties, description);
  if (name === 'Unarmed') continue;
  catalogItem('Fine ' + name, slots, stats, properties + ' · Fine', 'Ignore the first damage to the item, then remove Fine.');
  if (!range) {
    catalogItem('Balanced ' + name, slots, stats, properties + ' · Balanced', 'The opponent cannot Counter Attack.');
    catalogItem('Quick ' + name, slots, stats, properties + ' · Quick', 'The opponent cannot Parry.');
  }
  if (['Standard Weapon', 'Fencing Sword', 'Bastard Sword'].includes(name)) {
    catalogItem('Fey Steel ' + name, slots, stats, properties + ' · Fey Steel', 'Immune to damage and breakage.');
  }
}

const armor = [
  ['Light Armor', ['Body armor'], 'Armor 1', '', 'Basic body protection.'],
  ['Partial Armor', ['Body armor'], 'Armor 2 · Movement −0″ / −1″', '', 'Body protection with a movement penalty.'],
  ['Full Armor', ['Body armor'], 'Armor 3 · Movement −0″ / −2″', '', 'Heavy body protection.'],
  ['Knight Armor', ['Body armor'], 'Armor 3', 'Cannot Dash', 'Opponents ignore their bonuses to Overcome Armor.'],
  ['Helmet', ['Head'], '', 'Injury protection', 'A double on the post-battle Injury roll becomes a knockout and damages the helmet.'],
  ['Shield', ['Off hand'], 'Ranged Armor +1', 'Parry in melee', 'Adds ranged protection and allows a melee Parry.'],
];
for (const [name, slots, stats, properties, description] of armor) {
  catalogItem(name, slots, stats, properties, description);
  catalogItem('Fine ' + name, slots, stats, [properties, 'Fine'].filter(Boolean).join(' · '), description + ' Ignore the first damage to the item, then remove Fine.');
  if (['Partial Armor', 'Full Armor'].includes(name)) {
    catalogItem('Fey Steel ' + name, slots, stats, 'Fey Steel', description + ' Immune to damage.');
  }
}

const pack = ['Pack'];
const accessory = ['Accessory'];
const cloak = ['Cloak'];
for (const item of [
  ['Ranger’s Cloak', cloak, '+1 Wilderness and Scouting', 'Worn', 'Apply the bonus to tests without stacking it with the corresponding skill bonus.'],
  ['Scout’s Cloak', cloak, '−2 to spotting rolls against wearer', 'Worn', 'Applies while the wearer moves during a Raid sneak-up.'],
  ['Icon', accessory, '+1 Devotion', 'Worn', 'A religious emblem that assists Devotion tests.'],
  ['Large Quiver', accessory, '+1 shot', 'Worn', 'Make one extra shot after running out of ammunition.'],
  ['Fine Arrows / Bolts', accessory, '+3″ range', 'Worn', 'Works with self bows, longbows, and crossbows.'],
  ['Thief Tools', accessory, '+1 Expertise', 'Worn', 'Stacks with the Expertise skill bonus.'],
  ['Talisman', accessory, 'Survive on 5–6 on D6', 'Worn · Single-use', 'Roll if an Injury or Flight in the Dark result would kill the wearer. Lose the talisman either way.'],
  ['Mystical Ring', accessory, 'Quest on 11–12 on 2D6', 'Worn · Hero', 'Check when the wearer gains an advancement roll. The ring binds to its first Hero.'],
  ['Bandages', pack, 'Remove 1 Wound', 'Backpack · Single-use', 'Use during a battle to remove a wound. See the core rules for fighting a second battle while recovering.'],
  ['Brave Mule', pack, '+1 Backpack capacity', 'Campaign', 'Raises capacity to nine. Additional mules do not stack.'],
  ['Camp Gear', pack, '+1 camp proficiency tests', 'Backpack', 'Applies to tests from camp activities and events.'],
  ['Coil of Rope', pack, 'Reroll one or both dice', 'Backpack · Single-use', 'Use on a Wilderness test.'],
  ['Bottle of Red Duck', pack, '+1 Will', 'Backpack · Single-use', 'The extra Will expires at the end of the battle.'],
  ['Crafting Materials', pack, 'Apply Fine to 1 item', 'Campaign · Single-use', 'Improve one weapon or piece of armor.'],
  ['Delver’s Kit', pack, 'Pass one failed test', 'Backpack · Single-use', 'Applies to Wits or Expertise during a Site Battle.'],
  ['Fine Wine', pack, 'Sell for D3 Gold Marks', 'Campaign · Single-use', 'Alternatively, give it to a Disgruntled character to remove that status.'],
  ['Congealed Strand', pack, '1 Strand', 'Campaign · Single-use', 'Substitutes for a normal Strand when casting.'],
  ['Holy Water', pack, '6″ range · +3 / +1 damage', 'Backpack · Single-use', 'A Use Action automatically hits one Fey or Undead target.'],
  ['Map-making Kit', pack, 'Skip Travel rolls on mapped route', 'Campaign · Single-use', 'Chart a route just traveled and use it in either direction.'],
  ['Misty Water-Flower', pack, '', 'Campaign · Single-use', 'A poison casualty can recover without a post-battle Injury roll.'],
  ['Mystic Trinket', pack, '1 extra spell in the round', 'Backpack · Single-use', 'A Mystic may cast a second spell in that battle round.'],
  ['Potion of Fortune', pack, 'Ignore first physical harm', 'Backpack · Single-use', 'Negates the first physical Stun, Wound, or casualty.'],
  ['Ironshield Root', pack, '+1 Toughness (max 6)', 'Campaign · Single-use', 'Take before an encounter for the duration of the battle.'],
  ['Old Dusty Manual', pack, '+1 to one skill’s proficiency tests', 'Campaign · Single-use', 'The permanent bonus stacks with the skill bonus.'],
  ['Silvertree Leaf', pack, 'Reroll one post-battle Injury result', 'Campaign · Single-use', 'If the original result was fatal, add D3 turns of recovery. Excludes Flight in the Dark.'],
  ['Spell-breaker Herb', pack, 'Negate one spell on the user', 'Campaign · Single-use', 'Other targets resolve the spell as usual.'],
  ['Rations', pack, '−3 Gold Marks to upkeep', 'Campaign · Single-use', 'Use at most one set per upkeep roll.'],
  ['Repair Kit', pack, 'Repair 1 damaged item', 'Campaign · Single-use', 'Use to restore a damaged item.'],
  ['Springwind Berries', pack, 'Speed +1″ / +1″', 'Campaign · Single-use', 'Take before an encounter for the duration of that encounter.'],
  ['Strange Map', pack, '+1 Unexplored Location', 'Backpack · Single-use', 'Add the site to the wilderness on the campaign map.'],
  ['Tonic', pack, 'Recovery −1 campaign turn', 'Single-use', 'A character may benefit once per campaign turn.'],
  ['Torch', pack, '6″ illumination', 'Backpack · Single-use', 'The bearer must keep their shield and Bulky weapons out of use.'],
]) catalogItem(...item);

function normalizeItem(name) {
  return name.toLowerCase().replace(/[’‘]/g, "'").trim();
}

function findCatalogItem(name, slot) {
  let lookup = normalizeItem(name).replace(/^quality /, '').replace(/^(.+) \(fine\)$/, 'fine $1');
  if (lookup === 'throwing knife') lookup = 'throwing knives';
  return itemCatalog.find(item => item.slots.includes(slot) && normalizeItem(item.name) === lookup);
}
