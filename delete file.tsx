<section className="w-full px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="relative min-h-[800px]">


            {/* 2. Box Div */}
            <div className="absolute inset-x-0 bottom-[10%] z-10 px-4 flex justify-center">
              <div className="w-full max-w-[95%] md:max-w-[1000px] h-[500px] p-[3px] rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-white/50">
                <div className="w-full h-full bg-slate-950/90 backdrop-blur-md rounded-[21px] p-8 md:p-12 text-center relative overflow-hidden">

                  {/* Globe */}
                  <div className="absolute inset-0 z-0 flex items-center justify-center opacity-60 pointer-events-none">
                    <div className="w-[1000px] h-[1000px]">
                      <Cobe
                        variant="default"
                        scale={2}
                        className="w-full h-full"
                        baseColor="#555555"
                        glowColor="#a78bfa"
                        markerColor="#ec4899"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
                    <GradientText
                      colors={["#c084fc", "#e879f9", "#ffffff"]}
                      animationSpeed={4}
                      showBorder={false}
                      className="text-4xl md:text-5xl font-bold"
                    >
                      What is this place?
                    </GradientText>

                    <div className="space-y-6">
                      <ShinyText
                        text="This platform is built for people on the aromantic and asexual spectrums who want to connect on their own terms."
                        disabled={false}
                        speed={3}
                        className="text-md md:text-xl leading-relaxed text-slate-300 block"
                      />
                      <ShinyText
                        text="Whether you’re here for friendship, companionship, or a romantic relationship that respects your boundaries, this space is designed to support you."
                        disabled={false}
                        speed={3}
                        className="text-md md:text-xl leading-relaxed text-slate-300 block"
                      />
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

