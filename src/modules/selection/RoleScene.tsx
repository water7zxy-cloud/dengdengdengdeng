import type { SceneId } from '../../game/rules'

/** Decorative scenery sits behind the unchanged character artwork. */
export function RoleScene({ scene }: { scene: SceneId }) {
  return <svg className="role-scene-art" viewBox="0 0 240 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {scene === 'classroom' && <>
        <path d="M0 252H240V340H0Z" fill="#fff200" stroke="none" />
        <rect x="17" y="30" width="72" height="100" rx="2" fill="#fff" />
        <path d="M53 30V130M17 80H89" fill="none" />
        <rect x="111" y="47" width="113" height="93" rx="2" fill="#ed1717" />
        <path d="M121 129H213M143 69L158 66M170 83H202M126 100H178M0 278L240 290M18 340L77 252M197 340L173 252" fill="none" opacity=".5" />
      </>}
      {scene === 'playground' && <>
        <path d="M0 185Q60 161 120 180T240 172V340H0Z" fill="#fff200" stroke="none" />
        <path d="M-30 267Q120 174 270 267V340H-30Z" fill="#ed1717" />
        <path d="M-20 293Q120 192 260 293M-20 320Q120 219 260 320M-10 347Q120 247 250 347" fill="none" stroke="#fff" strokeWidth="3" />
        <path d="M24 196V92H99V191M24 102H99M65 92V171" fill="none" />
        <path d="M142 45Q159 33 177 44M172 67Q186 56 199 64" fill="none" opacity=".55" />
      </>}
      {scene === 'field' && <>
        <circle cx="183" cy="62" r="29" fill="#ed1717" stroke="none" />
        <path d="M0 203Q80 162 240 201V340H0Z" fill="#00a8ef" stroke="none" />
        <path d="M0 255Q131 177 240 240M0 291Q122 205 240 268M0 328Q122 242 240 303" fill="none" stroke="#111" />
        {[25, 51, 190, 216].map((x, i) => <g key={x} transform={`translate(${x} ${i % 2 ? 20 : 0})`}>
          <path d="M0 327Q8 267 0 211M0 251L-11 238M2 268L14 249M2 232L-6 221" fill="none" />
          <path d="M0 217Q-12 204-5 194Q7 203 0 217M-9 239Q-23 230-18 220Q-6 224-9 239M12 250Q10 234 21 231Q24 243 12 250" fill="#fff200" />
        </g>)}
      </>}
      {scene === 'office' && <>
        <path d="M0 261H240V340H0Z" fill="#00a8ef" stroke="none" />
        <rect x="18" y="33" width="90" height="151" rx="2" fill="#fff" />
        <path d="M18 84H108M18 134H108" fill="none" />
        {[30, 46, 65, 82].map((x, i) => <g key={x} fill={i % 2 ? '#ed1717' : '#00a8ef'}>
          <rect x={x} y={46 + i % 2 * 8} width="12" height={38 - i % 2 * 8} rx="1" />
          <rect x={x} y={97 + i % 2 * 4} width="12" height={37 - i % 2 * 4} rx="1" />
        </g>)}
        <rect x="152" y="44" width="58" height="76" rx="2" fill="#fff" />
        <path d="M164 64H199M164 78H191M164 92H198M0 278H240" fill="none" opacity=".6" />
      </>}
      {scene === 'shop' && <>
        <rect x="16" y="64" width="208" height="183" fill="#fff200" />
        <path d="M8 43H232L224 79H16Z" fill="#ed1717" />
        <path d="M42 43L45 79M82 43L84 79M122 43V79M162 43L160 79M202 43L198 79" fill="none" stroke="#fff" strokeWidth="16" />
        <path d="M19 132H221M19 192H221" fill="none" />
        {[37, 78, 160, 201].map((x, i) => <g key={x}>
          <rect x={x - 10} y="99" width="20" height="31" rx="5" fill={i % 2 ? '#00a8ef' : '#ed1717'} />
          <circle cx={x} cy="166" r="12" fill={i % 2 ? '#fff' : '#00a8ef'} />
        </g>)}
        <path d="M0 254H240V340H0Z" fill="#00a8ef" stroke="none" />
      </>}
      {scene === 'home' && <>
        <path d="M0 272Q120 241 240 272V340H0Z" fill="#ed1717" stroke="none" />
        <path d="M26 96L120 30L214 96V265H26Z" fill="#00a8ef" />
        <path d="M12 102L120 23L228 102" fill="none" stroke="#fff" strokeWidth="4" />
        <rect x="45" y="116" width="58" height="79" rx="3" fill="#fff200" />
        <path d="M74 116V195M45 155H103" fill="none" />
        <rect x="151" y="126" width="38" height="59" rx="3" fill="#fff200" />
        <path d="M160 144H181L176 135H166ZM171 144V162M164 162H178" fill="none" />
        <path d="M210 27V39M204 33H216M20 38V48M15 43H25M130 11V19" fill="none" stroke="#fff200" />
      </>}
    </g>
  </svg>
}
