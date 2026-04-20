# The matters of great importance



"He saw a way to win. The Full Web remained a possibility. His, now. It all depended. Another *twist*. Yes, he would win. Almost certainly. But that was no longer enough. The Full Web beckoned, tantalizingly, seductively, entrancingly..."

*The Player of Games, Iain M. Banks*

"The extraordinary episodes in which that shift of professional commitments occurs are the ones known in this essay as scientific revolutions. They are the tradition-shattering complements to the tradition-bound activity of normal science."

*The Structure of Scientific Revolutions, Thomas S. Kuhn*

Most technical work is normal science in Kuhn's sense — a marginally better compiler, faster observability tooling, a cleaner API. Valuable, cumulative, and not what I want to write about. I'm interested in the candidate revolutions: problems whose solution reorganizes everything downstream. Five of them, and the reasoning for each.

**Aligned superintelligence.** This one gates the others by necessity. A superintelligence is, roughly, any system that can out-strategize humans across the domains that matter. Build one that shares our values and most remaining problems become tractable — it can help design the reactors, the implants, the controllers. Build one whose values diverge from ours in any non-trivial way and the rest of the list becomes irrelevant, because we no longer get to decide what gets built next. The asymmetry is severe: alignment is the only item where failure is terminal rather than merely expensive. Which is why it sits at the root of the graph.

**Perfect world models.** Simulators faithful enough that planning, science, and design can happen in silico before touching reality. This is the bottleneck behind several downstream problems. Robotics can't cross the sim2real gap without them. Drug discovery, materials science, and fusion reactor design all currently burn enormous amounts of real-world experimentation that better simulators would collapse by orders of magnitude. And world models are part of what makes an AI agent competent in novel situations — you can't plan without a model of consequences. Alignment benefits too: a system with a better model of the world has a better model of what it is doing to the world.

**Self-healing brain-computer peripherals.** Current BCIs are rigid electrode arrays that the brain treats as wounds — gliosis encapsulates them and signal quality degrades within months to years. A peripheral that integrates with tissue on the decade scale is a different kind of device. It makes closed-loop neural interfaces medically routine (restoring vision, motor control, treating refractory depression and Parkinson's) rather than heroic one-off studies. It's also the substrate for high-bandwidth communication between minds and machines, which matters in a world where the machines are improving faster than the wetware they interface with.

**Post-scarcity energy.** Solar won. Three decades of a ~20% cost decline per doubling of installed capacity, sustained through trade wars, supply shocks, and repeated forecasts of its collapse. Utility-scale solar is now the cheapest source of new electricity in most geographies — US unsubsidized LCOE sits at $38–78/MWh, the global fixed-axis figure is ~$35/MWh, and single-axis trackers in the Middle East clear $27–37/MWh. New solar, unsubsidized, is within touching distance of the marginal fuel cost of existing gas plants. The curve has not broken; 2035 forecasts put global LCOE near $25/MWh.

The scale math is forgiving. One GW of nameplate solar at a 25% capacity factor produces ~2.2 TWh/year on ~9 square miles. US annual generation is 4,430 TWh. A naïve all-solar US grid wants ~2,000 GW nameplate, about 0.5% of US land area. Even at the 2–4x overbuild realistic planning requires, the footprint sits under 10% of current farmland. The remaining problems — transmission queues, multi-day storage, and the last 20–30% of grid share where marginal solar MWh collapse in value because the sun already saturates the daytime market — are real but bounded.

Why nuclear at all, then? Because the last 20–30% is where solar's curves stop helping you. Batteries cover hours, not months; seasonal variation at high latitudes is a different kind of problem than the intraday one. High-density industrial loads — data centers, heavy manufacturing, desalination — want firm power at a single interconnect, and a 1 GW reactor occupies roughly one square mile where the solar-plus-storage equivalent sprawls across tens. Much of industry needs high-temperature *heat*, not electrons, which reactors deliver directly. Some geographies (Korea, Japan, much of Northwest Europe) don't have the irradiance or the land for a solar-first grid.

The case for nuclear was never "cheaper than solar" and it won't be. The case is that a civilization without a working nuclear industry has foreclosed a set of capabilities — firm low-carbon power, industrial heat, dense siting, eventually space propulsion — that no amount of cheap silicon recovers.

And the hydrocarbons. The transition is about what gets *built* new, not what gets shut off. Existing gas plants will run for decades at declining capacity factors as solar eats their daytime hours; coal is being squeezed economically more than politically. What persists longer than most people expect is hydrocarbons in their non-electricity uses — chemical feedstocks, cement, steel reduction, aviation fuel, shipping. These are expensive to electrify, and the alternatives (green hydrogen, synthetic fuels, direct air capture plus synthesis) are all downstream of the cheap electricity solar is already delivering.

The dependency graph collapses cleanly: solar drives electricity prices toward zero, which unlocks the electrochemistry that finally displaces the remaining barrels. The hydrocarbon economy doesn't end by decree; it ends when its substitutes get cheap enough, and that's downstream of the energy node.

**General-purpose robotics.** Downstream of world models (sim2real) and energy (actuators, compute, manufacturing). Once these converge, you get machines that can do arbitrary physical work in unstructured environments. This closes a loop the rest of the list opens: if the previous four are mostly about extending cognition and its substrate, robotics is about translating cognition back into physical action at scale. Without it, much of the above remains locked inside papers and prototypes.

The structural claim, then, is that these aren't five independent bets — they form a connected graph. Alignment gates everything. Energy feeds the compute that trains the world models that enable the robots. World models feed scientific progress broadly and the controllers for reactors and implants specifically. BCIs sit partly downstream (fabrication, materials, closed-loop control) but also form an independent line of attack on the human-machine interface problem that the other four don't address.

If the graph is roughly right, then most things worth building in the next few decades are either nodes on it or edges between them. That's the hypothesis I want to test across the posts that follow — case by case, where the bottlenecks actually sit and what the intermediate milestones look like.
