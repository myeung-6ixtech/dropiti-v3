import { authClasses } from '@/styles/auth';

export default function AuthActionLoading() {
  return (
    <div className={authClasses.container}>
      <div className={authClasses.formSection}>
        <div className={authClasses.formWrapper}>
          <div className="flex items-center justify-center w-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Validating action link...</p>
            </div>
          </div>
        </div>
      </div>

      <div className={authClasses.contentSection}>
        <div className={authClasses.contentWrapper}>
          <div className="max-w-md">
            <h2 className={authClasses.headingWhite}>
              Validating Action
            </h2>
            <p className={authClasses.descriptionWhite}>
              Please wait while we verify your action link...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
