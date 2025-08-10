import { IconBaseProps } from '../../types/assets'

export const Clock = (props: IconBaseProps) => {
  return (
    <svg
      width={props.size ?? '20'}
      height={props.size ?? '21'}
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g id="Group">
        <path
          id="Vector"
          d="M10 19.5C14.9706 19.5 19 15.4706 19 10.5C19 5.52944 14.9706 1.5 10 1.5C5.02944 1.5 1 5.52944 1 10.5C1 15.4706 5.02944 19.5 10 19.5Z"
          stroke="#242424"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          id="Vector_2"
          d="M10 5.5V10.5L13 13.5"
          stroke="#242424"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
